import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";

export type RawRecord = Record<string, unknown>;

export interface ShopInfo {
  ShopCode: string;
  ShopName: string;
  EmRole?: string;
  ShopAddress?: string;
  GroupMail?: string;
  PhoneNumber?: string;
}

export interface UserInfo {
  uPharmaID: number;
  Email?: string;
  FullName: string;
  ShopLst: ShopInfo[];
}

export interface LoginResponse {
  RespCode: number;
  RespText: string;
  Token: string;
  UserInfo: UserInfo;
}

export interface ResourceResponse {
  success: boolean;
  resource: string;
  user: {
    uPharmaID: number;
    FullName: string;
    Email?: string;
  };
  shops: ShopInfo[];
  data: RawRecord[];
  failedShops: string[];
  fetchedAt: string;
}

export interface ShopPlanApiItem {
  RowID?: number;
  ShopCode: string;
  Month?: string | number;
  Year?: number;
  TimeMonth?: number;
  TimeYear?: number;
  TimeStart?: string;
  TimeCreate?: string;
  TimeModify?: string;
  TimeApprove?: string;
  ApproveID?: number;
  ApproveName?: string;
  Amount?: number;
  AmountR?: number;
  PointSales01?: number;
  PointSales01R?: number;
  PointRatioR?: number;
  QuantityHHS?: number;
  QuaCustomer?: number;
  QuaCustomerNew?: number;
  QuaCustomerOld?: number;
  QuaInvoice?: number;
  SKU?: number;
  RatioSlowSales?: number;
  QuaCustomerR?: number;
  QuaCustomerNewR?: number;
  QuaCustomerOldR?: number;
  QuaInvoiceR?: number;
  SKUR?: number;
  RatioSlowSalesR?: number;
  Status?: number;
  ApproveStatus?: number;
  ApproveStatusShop?: number;
  CusLevel1?: number;
  CusLevel2?: number;
  CusLevel3?: number;
  CusLevel4?: number;
  CusLevel5?: number;
  CusLevel6?: number;
  CusLevel1R?: number;
  CusLevel2R?: number;
  CusLevel3R?: number;
  CusLevel4R?: number;
  CusLevel5R?: number;
  CusLevel6R?: number;
}

export interface ShopPlanApiResponse {
  RespCode: number;
  RespText: string;
  ShopPlanLst: ShopPlanApiItem[];
}

export interface UserProfileResponse {
  user: RawRecord;
  raw: unknown;
}

export interface RemoteDatasets {
  inventory?: ResourceResponse;
  invoices?: ResourceResponse;
  messages?: ResourceResponse;
  employees?: ResourceResponse;
  orders?: ResourceResponse;
  statistics_shop?: ResourceResponse;
  customer_new?: ResourceResponse;
}

interface ResourceConfig {
  pathname: string;
  payload: (shopCode?: string) => RawRecord;
}

export interface ResourceLoadOptions {
  onFresh?: (data: ResourceResponse) => void;
  onShopLoaded?: (shopCode: string, data: any[]) => void;
  forceRefresh?: boolean;
  shopCodes?: string[];
}

@Injectable({ providedIn: "root" })
export class UpharmaService {
  readonly resourceNames = ["inventory", "invoices", "messages", "employees", "orders"] as const;

  private readonly authStorageKey = "upharma_session";
  private readonly cacheStorageKeyPrefix = "upharma_cache_";
  private readonly shopConcurrency = 6;
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, "");
  private readonly directApiBaseUrl = environment.directApiBaseUrl.replace(/\/$/, "");
  private readonly useBackendProxy = environment.useBackendProxy;
  private readonly inFlightResources = new Map<string, Promise<ResourceResponse>>();
  private readonly firebaseSalesSpeedInFlight = new Map<string, Promise<RawRecord[]>>();
  private readonly aggregatedInFlight = new Map<string, Promise<any>>();
  private readonly aggregatedCache = new Map<string, { data: any; fetchedAt: number }>();
  private sessionData: LoginResponse | null = null;
  private shopList: ShopInfo[] = [];

  private async fetchAggregatedFirebaseResource(resourceName: string, normalizedFirebase: string): Promise<Record<string, any> | null> {
    const cached = this.aggregatedCache.get(resourceName);
    const now = Date.now();
    if (cached && (now - cached.fetchedAt) < 60000) {
      return cached.data;
    }

    if (this.aggregatedInFlight.has(resourceName)) {
      return this.aggregatedInFlight.get(resourceName)!;
    }

    const promise = (async () => {
      try {
        const url = `${normalizedFirebase}/upharma_data/${resourceName}.json`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
        if (!res.ok) return null;
        const json = await res.json();
        if (!json) return null;
        const shopMap = json.data || json;
        if (shopMap && typeof shopMap === 'object' && !Array.isArray(shopMap)) {
          console.log(`[Firebase Fetch] ✅ Đã tải gộp ${resourceName} thành công từ 1 request: ${url}`);
          this.aggregatedCache.set(resourceName, { data: shopMap, fetchedAt: Date.now() });
          return shopMap;
        }
        return null;
      } catch {
        return null;
      } finally {
        this.aggregatedInFlight.delete(resourceName);
      }
    })();

    this.aggregatedInFlight.set(resourceName, promise);
    return promise;
  }

  constructor(private readonly router: Router) {
    this.clearResourceCache();
  }

  async login(credentials: { UserName: string; Password: string }): Promise<LoginResponse> {
    if (!credentials.UserName || !credentials.Password) {
      throw new Error("Vui lòng nhập tài khoản và mật khẩu");
    }

    const loginData = this.useBackendProxy
      ? await this.backendLogin(credentials)
      : await this.request<LoginResponse>("/User/UserLogin", {
          UserName: credentials.UserName,
          Password: credentials.Password,
        });

    if (!loginData.Token || !loginData.UserInfo?.uPharmaID || !Array.isArray(loginData.UserInfo.ShopLst)) {
      throw new Error(loginData.RespText || "Response đăng nhập không hợp lệ");
    }

    this.setSession(loginData);

    if (this.shopList.length === 0) {
      throw new Error("Phiên đăng nhập không có nhà thuốc hợp lệ");
    }

    return loginData;
  }

  getActiveShops(): ShopInfo[] {
    return this.shopList;
  }

  getSession(): LoginResponse | null {
    return this.sessionData || this.restoreSession();
  }

  isAuthenticated(): boolean {
    return Boolean(this.getSession());
  }

  clearSession(): void {
    this.sessionData = null;
    this.shopList = [];
    localStorage.removeItem(this.authStorageKey);
    this.clearResourceCache();
  }

  ensureLogin(): LoginResponse {
    const session = this.getSession();

    if (!session) {
      throw new Error("Chưa đăng nhập UPHARMA");
    }

    return session;
  }

  async callEndpoint<T>(
    pathname: string,
    payload: RawRecord,
    options: { forceRefresh?: boolean; onShopLoaded?: (shopCode: string, data: any[]) => void } = {},
  ): Promise<T> {
    if (pathname.includes("GetShopsSummaryCalculated")) {
      const firebaseDbUrl = (environment as any).firebaseDbUrl;
      if (firebaseDbUrl) {
        const url = `${firebaseDbUrl.replace(/\/$/, "")}/shops_summary.json`;
        console.log(`[Firebase Fetch] Đang tải shops_summary từ: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        return json as unknown as T;
      }
    }

    const isFirebaseTarget =
      !payload?.['_bypassFirebase'] &&
      (pathname.includes("GetShopPlanByTime") ||
      pathname.includes("GetSalesmanByShop") ||
      pathname.includes("GetReportSalesSpeed") ||
      pathname.includes("GetTransferOrderProcess") ||
      pathname.includes("GetProductOff") ||
      pathname.includes("GetItemLstWithFollower") ||
      pathname.includes("GetStableConsumptionCalculated") ||
      pathname.includes("GetSlowSellingCalculated") ||
      pathname.includes("GetOutOfStockCalculated") ||
      pathname.includes("GetKeyProductsCalculated") ||
      (pathname.includes("GetStatisticsShop") && payload?.['_useFirebaseCache']) ||
      (pathname.includes("GetCustomerNewLst") && payload?.['_useFirebaseCache']) ||
      (pathname.includes("GetReportSalesByShop") && (payload?.['_useFirebaseCache'] || payload?.['_useFirebaseKeyProducts'])));

    if (isFirebaseTarget) {
      let resourceName = "";
      if (pathname.includes("GetShopPlanByTime")) {
        resourceName = "shop_plan";
      } else if (pathname.includes("GetSalesmanByShop")) {
        resourceName = "employees_detail";
      } else if (pathname.includes("GetReportSalesSpeed")) {
        resourceName = "sales_speed";
      } else if (pathname.includes("GetStableConsumptionCalculated")) {
        resourceName = "stable_consumption_calculated";
      } else if (pathname.includes("GetSlowSellingCalculated")) {
        resourceName = "slow_selling_calculated";
      } else if (pathname.includes("GetOutOfStockCalculated")) {
        resourceName = "out_of_stock_calculated";
      } else if (pathname.includes("GetKeyProductsCalculated")) {
        resourceName = "key_products_calculated";
      } else if (pathname.includes("GetTransferOrderProcess")) {
        resourceName = "transfer_process";
      } else if (pathname.includes("GetProductOff")) {
        resourceName = "product_off";
      } else if (pathname.includes("GetItemLstWithFollower")) {
        resourceName = "product_catalog";
      } else if (pathname.includes("GetReportSalesByShop")) {
        if (payload?.['_useFirebaseKeyProducts']) {
          resourceName = "key_products";
        } else {
          resourceName = "sales_report";
        }
      } else if (pathname.includes("GetStatisticsShop") && payload?.['_useFirebaseCache']) {
        resourceName = "dashboard_statistics";
      } else if (pathname.includes("GetCustomerNewLst") && payload?.['_useFirebaseCache']) {
        resourceName = "dashboard_customers";
      }

      const firebaseDbUrl = (environment as any).firebaseDbUrl;
      const payloadShopCodes = this.extractShopCodesFromPayload(payload);
      const shopsToFetch =
        payloadShopCodes.length > 0
          ? this.shopList.filter((shop) => payloadShopCodes.includes(shop.ShopCode))
          : (this.shopList.length > 0 ? [this.shopList[0]] : []);

      if (firebaseDbUrl) {
        const normalizedFirebase = firebaseDbUrl.replace(/\/$/, "");

        if (resourceName === 'product_catalog') {
          const url = `${normalizedFirebase}/product_catalog.json`;
          console.log(`[Firebase Fetch] Đang tải danh mục sản phẩm từ: ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const json = await response.json();
          if (json && Array.isArray(json.items)) {
            return json.items.map((i: any) => ({
              ProductID: i.c,
              ProductCode: i.c,
              ProductName: i.n,
              UnitOfMeasure: i.u,
              Code: i.c,
              Name: i.n
            })) as unknown as T;
          }
          return (json?.data || json || []) as unknown as T;
        }

        if (shopsToFetch.length > 0 && (resourceName === 'dashboard_statistics' || resourceName === 'dashboard_customers')) {
          const shop = shopsToFetch[0];
          const url = `${normalizedFirebase}/shops/${shop.ShopCode}/upharma_data/${resourceName}.json`;
          console.log(`[Firebase Fetch] Đang tải ${resourceName} cho shop ${shop.ShopCode} từ: ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const json = await response.json();
          return (json?.data || {}) as T;
        }

        const shopMap = await this.fetchAggregatedFirebaseResource(resourceName, normalizedFirebase);
        if (shopMap) {
          const shopsData: any[] = [];
          for (const shop of shopsToFetch) {
            const rows = shopMap[shop.ShopCode];
            let list: any[] = [];
            if (Array.isArray(rows)) {
              list = rows;
            } else if (rows && typeof rows === 'object') {
              list = Object.values(rows);
            }
            shopsData.push(...list);
            if (typeof options.onShopLoaded === "function") {
              options.onShopLoaded(shop.ShopCode, list);
            }
          }
          return {
            success: true,
            RespCode: 0,
            RespText: "OK",
            resource: resourceName,
            shops: shopsToFetch,
            failedShops: [],
            data: shopsData,
            ShopPlanLst: shopsData,
            fetchedAt: new Date().toISOString(),
          } as unknown as T;
        }

        const shopsData: any[] = [];
        const failedShops: string[] = [];

        await Promise.all(
          shopsToFetch.map(async (shop) => {
            try {
              const cacheKey = `${shop.ShopCode}:${resourceName}`;
              let request = this.firebaseSalesSpeedInFlight.get(cacheKey);
              if (!request) {
                request = (async () => {
                  const url = `${normalizedFirebase}/shops/${shop.ShopCode}/upharma_data/${resourceName}.json`;
                  const response = await fetch(url);
                  if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                  }

                  const json = await response.json();
                  if (!json || !json.data) {
                    return [];
                  }
                  if (Array.isArray(json.data)) {
                    return json.data as RawRecord[];
                  }
                  if (typeof json.data === 'object') {
                    return Object.values(json.data) as RawRecord[];
                  }
                  return [];
                })();
                this.firebaseSalesSpeedInFlight.set(cacheKey, request);
              }
              const rows = await request;
              shopsData.push(...rows);
              if (typeof options.onShopLoaded === "function") {
                options.onShopLoaded(shop.ShopCode, rows);
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              failedShops.push(`${shop.ShopCode}: ${message}`);
              console.warn(`Lỗi tải ${resourceName} của shop ${shop.ShopCode}:`, err);
            } finally {
              const cacheKey = `${shop.ShopCode}:${resourceName}`;
              this.firebaseSalesSpeedInFlight.delete(cacheKey);
            }
          }),
        );

        const combined = {
          success: true,
          RespCode: 0,
          RespText: "OK",
          resource: resourceName,
          shops: shopsToFetch,
          failedShops,
          data: shopsData,
          ShopPlanLst: shopsData,
          fetchedAt: new Date().toISOString(),
        };

        return combined as unknown as T;
      }

      if ((environment as any).useStaticData) {
        const url = this.getStaticDataUrl(`assets/data/${resourceName}.json`);
        console.log(`[Firebase Fetch] Đang đọc fallback tĩnh: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Firebase Lỗi 404?] URL: ${url} - Trạng thái: ${response.status} - Chi tiết:`, errText);
          throw new Error(`Không thể đọc data tĩnh của ${resourceName}. Mã lỗi: ${response.status}`);
        }
        const json = await response.json();
        console.log(`[Firebase Fetch] ✅ Đã đọc được dữ liệu tĩnh từ URL: ${url}`);
        return json as T;
      }

      throw new Error(`Không có Firebase hoặc dữ liệu shop để đọc ${pathname}`);
    }

    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return this.request<T>(normalizedPath, payload);
  }

  async getSalesmanByShop(shopCode: string): Promise<RawRecord[]> {
    const session = this.ensureLogin();
    const response = await this.callEndpoint<RawRecord>(
      "/Organization/GetSalesmanByShop",
      {
        Token: session.Token,
        uPharmaID: String(session.UserInfo.uPharmaID),
        ShopCode: shopCode,
      },
    );

    const listKeys = [
      "SalesmanLst",
      "SalesmanByShopLst",
      "SalesmanShopLst",
      "EmployeeLst",
      "EmployeeInfoLst",
      "DataLst",
      "ListData",
      "Data",
      "data",
      "Rows",
    ];
    const queue: unknown[] = [response];
    const visited = new Set<object>();

    while (queue.length > 0) {
      const value = queue.shift();
      if (!value || typeof value !== "object" || visited.has(value)) continue;
      visited.add(value);

      if (Array.isArray(value)) {
        const records = value.filter(
          (item): item is RawRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item),
        );
        if (records.length === value.length) return records;
        continue;
      }

      const record = value as RawRecord;
      for (const key of listKeys) {
        const list = record[key];
        if (Array.isArray(list)) {
          const records = list.filter(
            (item): item is RawRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item),
          );
          if (records.length === list.length) return records;
          throw new Error(`Invalid salesman list returned for ${shopCode}.`);
        }
      }

      queue.push(...Object.values(record).filter((item) => item && typeof item === "object"));
    }

    throw new Error(`No salesman list returned for ${shopCode}.`);
  }

  async loadShopPlanByTime(payload: RawRecord): Promise<ShopPlanApiResponse> {
    return this.callEndpoint<ShopPlanApiResponse>("/ShopPlan/GetShopPlanByTime", payload);
  }

  private extractShopCodesFromPayload(payload: RawRecord): string[] {
    const raw = payload["ShopLst"] || payload["ShopCode"];

    if (typeof raw === "string") {
      return raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (Array.isArray(raw)) {
      return raw
        .map((value) => String(value).trim())
        .filter(Boolean);
    }

    return [];
  }

  private async triggerGithubCronjob(): Promise<void> {
    const lastTrigger = localStorage.getItem('last_auto_cronjob');
    if (lastTrigger && Date.now() - parseInt(lastTrigger) < 5 * 60 * 1000) {
      return; // Do not trigger more than once every 5 minutes
    }
    
    const githubPat = localStorage.getItem('github_pat');
    if (!githubPat) {
      console.warn("Không có Github PAT để tự động kích hoạt cronjob.");
      return;
    }

    try {
      localStorage.setItem('last_auto_cronjob', Date.now().toString());
      console.log("Dữ liệu tĩnh trống, đang tự động kích hoạt Github Action...");
      
      const response = await fetch('https://api.github.com/repos/LienHuynh04/an-upharma/actions/workflows/fetch-data.yml/dispatches', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubPat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'master'
        })
      });

      if (!response.ok) {
        throw new Error(`Lỗi gọi GitHub API: ${response.status} ${response.statusText}`);
      }
      
      console.log("Đã gửi lệnh chạy Cronjob thành công!");
    } catch (err) {
      console.error("Lỗi khi kích hoạt tự động cronjob:", err);
    }
  }

  prefetchSalesSpeed(): void {
    const session = this.sessionData;

    if (!session) {
      return;
    }

    const shops = [...this.shopList];
    const requests = shops.flatMap((shop) =>
      this.getSalesSpeedPrefetchPayloads(session, shop.ShopCode).map((payload) => ({ payload })),
    );

    void this.runWithConcurrency(requests, async ({ payload }) => {
      try {
        await this.callEndpoint("/SalesInvoice/GetReportSalesSpeed", payload);
      } catch (error) {
        console.warn("Prefetch GetReportSalesSpeed thất bại:", error);
      }
    });
  }

  async getUserInfoByID(): Promise<UserProfileResponse> {
    const session = this.ensureLogin();
    const payload = {
      Token: session.Token,
      uPharmaID: session.UserInfo.uPharmaID,
    };
    const response = await this.callEndpoint<unknown>("/User/GetUserInfoByID", payload);

    return {
      user: this.extractObject(response),
      raw: response,
    };
  }

  formatUpharmaDateTime(date: Date): string {
    return this.formatDateTime(date);
  }

  async loadAllResources(options: { onFresh?: (datasets: RemoteDatasets) => void } = {}): Promise<RemoteDatasets> {
    const datasets: RemoteDatasets = {};
    const settled = await Promise.all(
      this.resourceNames.map(async (resourceName) => {
        try {
          return {
            resourceName,
            data: await this.fetchResource(resourceName, {
              onFresh: options.onFresh
                ? (fresh) => {
                    datasets[resourceName] = fresh;
                    options.onFresh?.({ ...datasets });
                  }
                : undefined,
            }),
          };
        } catch (error) {
          console.warn(`Không tải được API ${resourceName}:`, error);
          return { resourceName, data: null };
        }
      }),
    );

    for (const entry of settled) {
      if (entry.data) {
        datasets[entry.resourceName] = entry.data;
      }
    }

    return datasets;
  }

  async loadInventoryResource(
    options: ResourceLoadOptions = {},
  ): Promise<ResourceResponse> {
    if (!this.sessionData) {
      this.ensureLogin();
    }

    return this.fetchResource("inventory", options);
  }

  async loadInventoryNewDirect(
    options: ResourceLoadOptions = {},
  ): Promise<ResourceResponse> {
    const session = this.sessionData || this.ensureLogin();
    const data: RawRecord[] = [];
    const failedShops: string[] = [];
    const requestedShopCodes = new Set(options.shopCodes || []);
    const selectedShops = requestedShopCodes.size > 0
      ? this.shopList.filter((shop) => requestedShopCodes.has(shop.ShopCode))
      : (this.shopList.length > 0 ? [this.shopList[0]] : []);
    const shops = [...selectedShops];

    const worker = async (): Promise<void> => {
      for (let shop = shops.shift(); shop; shop = shops.shift()) {
        try {
          const responseData = await this.request<RawRecord>("/LocalStore/GetInventoryShop", {
            uPharmaID: session.UserInfo.uPharmaID,
            Token: session.Token,
            ShopCode: shop.ShopCode,
            BranchLst: "",
            ProductID: "",
            LotCode: "",
            PackageID: null,
            StoreType: "",
          });

          data.push(
            ...this.extractArray(responseData).map((item) => ({
              ...item,
              __shopCode: shop.ShopCode,
              __shopName: shop.ShopName,
            })),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failedShops.push(`${shop.ShopCode}: ${message}`);
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(this.shopConcurrency, selectedShops.length) }, () => worker()),
    );

    if (selectedShops.length > 0 && failedShops.length === selectedShops.length) {
      throw new Error(`inventory_new: tất cả nhà thuốc đều lỗi (${failedShops.join(", ")})`);
    }

    return {
      success: true,
      resource: "inventory_new",
      user: {
        uPharmaID: session.UserInfo.uPharmaID,
        FullName: session.UserInfo.FullName,
        Email: session.UserInfo.Email,
      },
      shops: selectedShops,
      data,
      failedShops,
      fetchedAt: new Date().toISOString(),
    };
  }

  clearResourceCache(): void {
    this.firebaseSalesSpeedInFlight.clear();
    this.inFlightResources.clear();
    this.aggregatedInFlight.clear();
    this.aggregatedCache.clear();
    const cachePrefixes = [
      this.cacheStorageKeyPrefix,
      "upharma_call_",
      "upharma_sales_invoice_report_cache_v1",
    ];

    if (typeof localStorage !== "undefined") {
      for (const key of Object.keys(localStorage)) {
        if (cachePrefixes.some((prefix) => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      }
    }

    if (typeof indexedDB !== "undefined") {
      for (const databaseName of ["upharma-cache", "upharma-out-stock-cache"]) {
        const request = indexedDB.deleteDatabase(databaseName);
        request.onerror = () => console.error(`Không xóa được IndexedDB ${databaseName}:`, request.error);
        request.onblocked = () => console.warn(`Đang chờ đóng kết nối để xóa IndexedDB ${databaseName}.`);
      }
    }
  }

  private setSession(loginData: LoginResponse): void {
    const filteredShopList = loginData.UserInfo.ShopLst.filter(
      (shop) => !environment.excludedShopCodes.includes(shop.ShopCode),
    );
    loginData = {
      ...loginData,
      UserInfo: {
        ...loginData.UserInfo,
        ShopLst: filteredShopList,
      },
    };
    this.sessionData = loginData;
    this.shopList = [...filteredShopList].sort(
      (firstShop, secondShop) => firstShop.ShopCode.localeCompare(secondShop.ShopCode, "vi"),
    );

    localStorage.setItem(
      this.authStorageKey,
      JSON.stringify({
        loginDate: this.getTodayKey(),
        session: loginData,
      }),
    );
  }

  private restoreSession(): LoginResponse | null {
    const rawSession = localStorage.getItem(this.authStorageKey);

    if (!rawSession) {
      return null;
    }

    try {
      const parsedSession = JSON.parse(rawSession) as { loginDate?: string; session?: LoginResponse };

      if (parsedSession.loginDate !== this.getTodayKey() || !parsedSession.session?.Token) {
        this.clearSession();
        return null;
      }

      this.setSession(parsedSession.session);
      return parsedSession.session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private getTodayKey(): string {
    return this.formatDateTime(new Date()).slice(0, 10);
  }

  private async fetchResource(
    resourceName: keyof RemoteDatasets,
    options: ResourceLoadOptions = {},
  ): Promise<ResourceResponse> {
    const session = this.sessionData;

    if (!session) {
      throw new Error("Chưa đăng nhập UPHARMA");
    }

    if (!this.getResourceConfig(resourceName)) {
      throw new Error(`Không hỗ trợ nhóm API: ${resourceName}`);
    }

    if ((environment as any).useStaticData) {
      const firebaseDbUrl = (environment as any).firebaseDbUrl;
      if (firebaseDbUrl && this.shopList.length > 0) {
        const normalizedFirebase = firebaseDbUrl.replace(/\/$/, "");
        const requestedShopCodes = new Set(options.shopCodes || []);
        const shopsToFetch = requestedShopCodes.size > 0
          ? this.shopList.filter((shop) => requestedShopCodes.has(shop.ShopCode))
          : (this.shopList.length > 0 ? [this.shopList[0]] : []);
        const shopMap = await this.fetchAggregatedFirebaseResource(resourceName, normalizedFirebase);
        if (shopMap) {
          const shopsData: any[] = [];
          for (const shop of shopsToFetch) {
            const raw = shopMap[shop.ShopCode];
            let rawList: any[] = [];
            if (Array.isArray(raw)) {
              rawList = raw;
            } else if (raw && typeof raw === 'object') {
              rawList = Object.values(raw);
            }
            const filteredData = rawList
              .filter((item: any) => {
                const code = String(item?.ProductCode || item?.ProductID || item?.MaSP || item?.Code || "").toUpperCase().trim();
                const name = String(item?.ProductName || item?.Product_Name || item?.TenSP || item?.Name || "").toUpperCase().trim();
                return !(code.includes("VOUCHER") || name.includes("VOUCHER") || code.startsWith("VC"));
              })
              .map((item: any) => ({
                ...item,
                __shopCode: item.__shopCode || item.ShopCode || item.shopCode || shop.ShopCode,
                __shopName: item.__shopName || item.ShopName || item.shopName || shop.ShopName,
                ShopCode: item.ShopCode || item.shopCode || shop.ShopCode,
                ShopName: item.ShopName || item.shopName || shop.ShopName,
              }));

            shopsData.push(...filteredData);
            if (options.onShopLoaded) {
              options.onShopLoaded(shop.ShopCode, filteredData);
            }
          }

          return {
            success: true,
            resource: resourceName,
            user: {
              uPharmaID: session.UserInfo.uPharmaID,
              FullName: session.UserInfo.FullName,
              Email: session.UserInfo.Email,
            },
            shops: shopsToFetch,
            data: shopsData,
            failedShops: [],
            fetchedAt: new Date().toISOString(),
          };
        }

        const shopsData: any[] = [];
        const failedShops: string[] = [];
        
        await Promise.all(
          shopsToFetch.map(async (shop) => {
            try {
              const url = `${normalizedFirebase}/shops/${shop.ShopCode}/upharma_data/${resourceName}.json`;
              console.log(`[Firebase Fetch] Đang tải ${resourceName} cho shop ${shop.ShopCode} từ: ${url}`);
              
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000);

              const response = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              const json = await response.json();
              let rawList: any[] = [];
              if (json) {
                if (Array.isArray(json)) {
                  rawList = json;
                } else if (Array.isArray(json.data)) {
                  rawList = json.data;
                } else if (json.data && typeof json.data === "object") {
                  rawList = Object.values(json.data);
                } else if (typeof json === "object") {
                  rawList = Object.values(json);
                }
              }

              const filteredData = rawList
                .filter((item: any) => {
                  const code = String(item?.ProductCode || item?.ProductID || item?.MaSP || item?.Code || "").toUpperCase().trim();
                  const name = String(item?.ProductName || item?.Product_Name || item?.TenSP || item?.Name || "").toUpperCase().trim();
                  return !(code.includes("VOUCHER") || name.includes("VOUCHER") || code.startsWith("VC"));
                })
                .map((item: any) => ({
                  ...item,
                  __shopCode: item.__shopCode || item.ShopCode || item.shopCode || shop.ShopCode,
                  __shopName: item.__shopName || item.ShopName || item.shopName || shop.ShopName,
                  ShopCode: item.ShopCode || item.shopCode || shop.ShopCode,
                  ShopName: item.ShopName || item.shopName || shop.ShopName,
                }));

              shopsData.push(...filteredData);
              if (options.onShopLoaded) {
                options.onShopLoaded(shop.ShopCode, filteredData);
              }
            } catch (err: any) {
              console.warn(`Không tải được dữ liệu ${resourceName} của shop ${shop.ShopCode}:`, err);
              failedShops.push(`${shop.ShopCode}: ${err.message}`);
            }
          })
        );
        
        const combinedData: ResourceResponse = {
          success: true,
          resource: resourceName,
          user: {
            uPharmaID: session.UserInfo.uPharmaID,
            FullName: session.UserInfo.FullName,
            Email: session.UserInfo.Email,
          },
          shops: shopsToFetch,
          data: shopsData,
          failedShops,
          fetchedAt: new Date().toISOString(),
        };
        
        if (options.onFresh) options.onFresh(combinedData);
        return combinedData;
      }

      const url = this.getStaticDataUrl(`assets/data/${resourceName}.json`);
      console.log(`[Firebase Fetch] Đang tải resource ${resourceName} từ: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Firebase Lỗi 404?] URL: ${url} - Trạng thái: ${response.status} - Chi tiết:`, errText);
        throw new Error(`Không thể đọc data tĩnh của ${resourceName}. Mã lỗi: ${response.status}`);
      }
      const data = await response.json() as ResourceResponse;
      console.log(`[Firebase Fetch] ✅ KẾT NỐI THÀNH CÔNG: Đã lấy được dữ liệu cho ${resourceName} từ: ${url}`);
      if (options.onFresh) options.onFresh(data);
      return data;
    }

    if (this.useBackendProxy) {
      return this.requestBackendResource(resourceName, session);
    }

    const shopCodes = this.shopList.map((shop) => shop.ShopCode).join(",");
    const cacheKey = `${resourceName}_${session.UserInfo.uPharmaID}_${shopCodes}`;
    const fresh = await this.dedupeResourceFetch(cacheKey, resourceName, session);
    options.onFresh?.(fresh);
    return fresh;
  }

  private dedupeResourceFetch(
    cacheKey: string,
    resourceName: keyof RemoteDatasets,
    session: LoginResponse,
  ): Promise<ResourceResponse> {
    const pending = this.inFlightResources.get(cacheKey);

    if (pending) {
      return pending;
    }

    const request = this.fetchResourceFromApi(resourceName, session)
      .finally(() => {
        this.inFlightResources.delete(cacheKey);
      });

    this.inFlightResources.set(cacheKey, request);

    return request;
  }

  private async fetchResourceFromApi(
    resourceName: keyof RemoteDatasets,
    session: LoginResponse,
  ): Promise<ResourceResponse> {
    const config = this.getResourceConfig(resourceName)!;
    const data: RawRecord[] = [];
    const failedShops: string[] = [];
    const shops = [...this.shopList];

    const worker = async (): Promise<void> => {
      for (let shop = shops.shift(); shop; shop = shops.shift()) {
        try {
          const responseData = await this.request<RawRecord>(config.pathname, {
            ...config.payload(shop.ShopCode),
            Token: session.Token,
            uPharmaID: String(session.UserInfo.uPharmaID),
            ShopCode: shop.ShopCode,
          });

          data.push(
            ...this.extractArray(responseData).map((item) => ({
              ...item,
              __shopCode: shop.ShopCode,
              __shopName: shop.ShopName,
            })),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failedShops.push(`${shop.ShopCode}: ${message}`);
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(this.shopConcurrency, this.shopList.length) }, () => worker()),
    );

    if (this.shopList.length > 0 && failedShops.length === this.shopList.length) {
      throw new Error(`${resourceName}: tất cả nhà thuốc đều lỗi (${failedShops.join(", ")})`);
    }

    return {
      success: true,
      resource: resourceName,
      user: {
        uPharmaID: session.UserInfo.uPharmaID,
        FullName: session.UserInfo.FullName,
        Email: session.UserInfo.Email,
      },
      shops: this.shopList,
      data,
      failedShops,
      fetchedAt: new Date().toISOString(),
    };
  }

  private getSalesSpeedPrefetchPayloads(session: LoginResponse, shopCode: string): RawRecord[] {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
    const monthWindow = 3;
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthWindow + 1, 1, 0, 0, 0);
    const base = {
      uPharmaID: session.UserInfo.uPharmaID,
      Token: session.Token,
      ProductID: "",
      ViewCity: 0,
      ShopLst: shopCode,
    };

    return [
      {
        ...base,
        TimeStart: this.formatDateTime(todayStart),
        TimeEnd: this.formatDateTime(todayEnd),
        GetType: "Week",
      },
      {
        ...base,
        TimeStart: this.formatDateTime(monthStart),
        TimeEnd: this.formatDateTime(todayEnd),
        GetType: "Week",
      },
    ];
  }

  private async runWithConcurrency<T>(items: T[], handler: (item: T) => Promise<void>): Promise<void> {
    const queue = [...items];
    const worker = async (): Promise<void> => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        await handler(item);
      }
    };

    await Promise.all(Array.from({ length: Math.min(this.shopConcurrency, items.length) }, () => worker()));
  }

  private async request<T>(pathname: string, payload: RawRecord): Promise<T> {
    if (this.useBackendProxy) {
      return this.requestViaBackend<T>(pathname, payload);
    }

    const response = await fetch(`${this.directApiBaseUrl}${pathname}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    let data: RawRecord;

    try {
      data = responseText ? (JSON.parse(responseText) as RawRecord) : {};
    } catch {
      if (response.ok) {
        throw new Error(`${pathname}: response không phải JSON`);
      }
      data = { message: responseText.trim().slice(0, 200) };
    }

    if (!response.ok) {
      if (response.status === 401 || this.isTokenErrorMessage(data)) {
        this.handleInvalidToken();
      }
      const detail = String(data["message"] || data["RespText"] || "").trim();
      throw new Error(`${pathname}: HTTP ${response.status}${detail ? ` — ${detail}` : ""}`);
    }

    this.assertBusinessResponse(pathname, data);

    return data as T;
  }

  private async backendLogin(credentials: { UserName: string; Password: string }): Promise<LoginResponse> {
    const response = await fetch(`${this.apiBaseUrl}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return this.parseApiResponse<LoginResponse>(response, "/api/upharma/login");
  }

  private async requestViaBackend<T>(pathname: string, payload: RawRecord): Promise<T> {
    const response = await fetch(`${this.apiBaseUrl}/call`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pathname,
        payload,
      }),
    });
    const proxyData = await this.parseApiResponse<RawRecord>(response, "/api/upharma/call");
    const data = (proxyData["data"] || proxyData) as RawRecord;

    this.assertBusinessResponse(pathname, data);

    return data as T;
  }

  private async requestBackendResource(resourceName: keyof RemoteDatasets, session: LoginResponse): Promise<ResourceResponse> {
    const response = await fetch(`${this.apiBaseUrl}/resource`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resourceName,
        Token: session.Token,
        uPharmaID: session.UserInfo.uPharmaID,
        FullName: session.UserInfo.FullName,
        Email: session.UserInfo.Email,
        shops: this.shopList,
      }),
    });

    return this.parseApiResponse<ResourceResponse>(response, `/api/upharma/resource/${resourceName}`);
  }

  private async parseApiResponse<T>(response: Response, pathname: string): Promise<T> {
    const responseText = await response.text();
    let data: RawRecord;

    try {
      data = responseText ? (JSON.parse(responseText) as RawRecord) : {};
    } catch {
      throw new Error(`${pathname}: response không phải JSON`);
    }

    if (!response.ok) {
      if (response.status === 401 || this.isTokenErrorMessage(data)) {
        this.handleInvalidToken();
      }
      throw new Error(String(data["message"] || data["RespText"] || `${pathname}: HTTP ${response.status}`));
    }

    this.assertBusinessResponse(pathname, data);

    return data as T;
  }

  private assertBusinessResponse(pathname: string, data: RawRecord): void {
    if (Object.hasOwn(data, "RespCode") && Number(data["RespCode"]) !== 0) {
      if (this.isTokenErrorMessage(data)) {
        this.handleInvalidToken();
      }
      throw new Error(String(data["RespText"] || `${pathname}: RespCode ${data["RespCode"]}`));
    }
  }

  private isTokenErrorMessage(data: RawRecord): boolean {
    const text = String(data["RespText"] || data["message"] || "").trim().toLowerCase();
    return text === "token không hợp lệ";
  }

  private handleInvalidToken(): never {
    this.clearSession();
    void this.router.navigateByUrl("/login", { replaceUrl: true });
    throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
  }

  private extractArray(data: unknown): RawRecord[] {
    if (Array.isArray(data)) {
      return data.filter((item): item is RawRecord => Boolean(item) && typeof item === "object");
    }

    if (!data || typeof data !== "object") {
      return [];
    }

    const record = data as RawRecord;
    const preferredKeys = ["Data", "data", "DataLst", "ListData", "InventoryLst", "InventoryList", "Table", "Rows"];

    for (const key of preferredKeys) {
      const value = record[key];

      if (Array.isArray(value)) {
        return value.filter((item): item is RawRecord => Boolean(item) && typeof item === "object");
      }
    }

    const queue: { val: unknown; depth: number }[] = Object.values(record)
      .filter((v) => v && typeof v === "object")
      .map((val) => ({ val, depth: 1 }));

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;
      const { val, depth } = item;

      if (Array.isArray(val)) {
        return val.filter((element): element is RawRecord => Boolean(element) && typeof element === "object");
      }

      if (depth < 2 && val && typeof val === "object") {
        for (const child of Object.values(val as RawRecord)) {
          if (child && typeof child === "object") {
            queue.push({ val: child, depth: depth + 1 });
          }
        }
      }
    }

    return [];
  }

  private extractObject(data: unknown): RawRecord {
    if (!data || typeof data !== "object") {
      return {};
    }

    const record = data as RawRecord;
    const preferredKeys = ["Data", "data", "UserInfo", "User", "Info", "Profile"];

    for (const key of preferredKeys) {
      const value = record[key];

      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as RawRecord;
      }
    }

    return record;
  }

  private getResourceConfig(resourceName: keyof RemoteDatasets): ResourceConfig | null {
    const now = new Date();
    const currentTime = this.formatDateTime(now);
    const today = currentTime.slice(0, 10);
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const configs: Record<keyof RemoteDatasets, ResourceConfig> = {
      inventory: {
        pathname: "/LocalStore/GetInventoryShop",
        payload: (shopCode?: string) => ({ BranchLst: shopCode || "", ProductID: "", LotCode: "", PackageID: null, StoreType: "" }),
      },
      invoices: {
        pathname: "/InvoiceOnline/GetInvoiceOrderOnByTime",
        payload: () => ({ TimeStart: `${today} 06:00:00`, TimeEnd: `${today} 23:59:00` }),
      },
      messages: {
        pathname: "/NTMessage/GetMessageByTime",
        payload: () => ({ TimeStart: `${today} 00:00:00`, TimeEnd: currentTime }),
      },
      employees: {
        pathname: "/Organization/GetSalesmanByShop",
        payload: () => ({}),
      },
      orders: {
        pathname: "/SalesInvoice/GetOrderHeaderByShop",
        payload: () => ({
          TimeStart: `${today} 06:00:00`,
          TimeEnd: currentTime,
          PageNumber: 1,
          NumberRow: 0,
        }),
      },
      statistics_shop: {
        pathname: "/CancelProduct/GetStatisticsShop",
        payload: () => ({
          ShopCode: "",
          TimeStart: currentTime,
          TimeEnd: currentTime,
        }),
      },
      customer_new: {
        pathname: "/Buyer/GetCustomerNewLst",
        payload: () => ({
          Month: now.getMonth() + 1,
          Year: now.getFullYear(),
          ShopCode: "",
        }),
      },
    };

    return configs[resourceName] || null;
  }

  private formatDateTime(date: Date): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return `${values["year"]}-${values["month"]}-${values["day"]} ${values["hour"]}:${values["minute"]}:${values["second"]}`;
  }

  private getStaticDataUrl(filename: string): string {
    const firebaseDbUrl = (environment as any).firebaseDbUrl;
    if (firebaseDbUrl) {
      const normalizedFirebase = firebaseDbUrl.replace(/\/$/, "");
      if (filename === "assets/data/login.json") {
        return `${normalizedFirebase}/sync_logs/login.json`;
      }
      if (filename.startsWith("assets/data/")) {
        const resource = filename.replace("assets/data/", "");
        return `${normalizedFirebase}/upharma_data/${resource}`;
      }
    }
    
    // Fallback if firebaseDbUrl is not defined
    const basePath = document.querySelector('base')?.getAttribute('href') || '/';
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    return `${normalizedBase}${filename}`;
  }
}
