import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  ExpiryStatus,
  formatMoney,
  isWarehouseStore,
  normalizeInventoryRow,
  UNDER_12_MONTHS_DAYS,
  UNDER_3_MONTHS_DAYS,
  UNDER_6_MONTHS_DAYS,
} from "../inventory-utils";
import { RawRecord, ShopInfo, ShopPlanApiItem, UpharmaService } from "../upharma.service";
import { environment } from "../../environments/environment";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ShopInventorySummary {
  shopCode: string;
  shopName: string;
  totalProducts: number;
  totalValue: number;
  expiredCount: number;
  expiredValue: number;
  expiredRate: string;
  dangerCount: number;
  dangerValue: number;
  dangerRate: string;
  warningCount: number;
  warningValue: number;
  warningRate: string;
  safeCount: number;
  safeValue: number;
  safeRate: string;
  normalCount: number;
  normalValue: number;
  normalRate: string;
}

interface ShopHhsSummary {
  shopCode: string;
  shopName: string;
  amount: number;
  amountR: number;
  hhs: number;
  hhsR: number;
  salesPercent: number;
  hhsRatio: number;
  hhsRatioTarget: number;
  hhsPercent: number;
  projectedAmount: number;
}

interface SyncLog {
  message: string;
  type: "info" | "success" | "error";
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: "app-inventory-summary",
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: "./inventory-summary.component.html",
})
export class InventorySummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly upharma = inject(UpharmaService);

  // ── Danh sách nhà thuốc của tài khoản ──────────────────
  shopList: ShopInfo[] = [];
  activeShopCode = "";
  activeExpiryFilter: ExpiryStatus | "all" = "all";

  // ── Thời gian ────────────────────────────────────────────
  readonly months = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i);
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  // ── Loading & Trạng thái ─────────────────────────────────
  isInventoryLoading = false;
  isHhsLoading = false;
  isSyncing = false;
  syncStatus = "";
  loadingTitle = "";
  loadingProgressPercent = 0;
  errorText = "";
  successText = "";
  syncLogs: SyncLog[] = [];

  // ── Dữ liệu đã chuẩn hóa ─────────────────────────────────
  shopSummaries: ShopInventorySummary[] = [];
  hhsSummaries: ShopHhsSummary[] = [];

  // ── Ngày ─────────────────────────────────────────────────
  daysElapsed = 0;
  totalDaysInMonth = 0;

  // ── Getters ───────────────────────────────────────────────
  get activeShopTitle(): string {
    const shop = this.shopList.find((s) => s.ShopCode === this.activeShopCode) ||
                 this.shopSummaries.find((s) => s.shopCode === this.activeShopCode);
    if (!shop) return this.activeShopCode || "Chưa chọn nhà thuốc";
    const code = (shop as any).ShopCode || (shop as any).shopCode;
    const name = (shop as any).ShopName || (shop as any).shopName || code;
    return `${code} - ${name}`;
  }

  get activeShopSummary(): ShopInventorySummary | undefined {
    return this.shopSummaries.find((s) => s.shopCode === this.activeShopCode);
  }

  get activeHhs(): ShopHhsSummary | undefined {
    return this.hhsSummaries.find((s) => s.shopCode === this.activeShopCode);
  }

  // ── Utils ─────────────────────────────────────────────────
  readonly formatMoney = formatMoney;

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.shopList = this.upharma.getActiveShops() || [];
    if (this.shopList.length > 0) {
      this.activeShopCode = this.shopList[0].ShopCode;
    }
    this.computeDays();
    this.reload();
  }

  onPeriodChange(): void {
    this.computeDays();
    this.loadHhs();
  }

  setExpiryFilter(key: ExpiryStatus | "all"): void {
    this.activeExpiryFilter = key;
    this.cdr.detectChanges();
  }

  async onShopChange(shopCode: string): Promise<void> {
    if (!shopCode) return;
    this.activeShopCode = shopCode;
    this.cdr.detectChanges();

    // Kiểm tra xem nhà thuốc này đã có data chưa, nếu chưa có data thì tự động fetch bổ sung
    const summary = this.shopSummaries.find((s) => s.shopCode === shopCode);
    const hhs = this.hhsSummaries.find((h) => h.shopCode === shopCode);

    if (!summary || summary.totalProducts === 0 || !hhs || (hhs.amount === 0 && hhs.amountR === 0)) {
      await this.fetchSingleShopData(shopCode);
    }

    this.cdr.detectChanges();
  }

  async reload(): Promise<void> {
    this.errorText = "";
    this.successText = "";
    await Promise.all([this.loadInventoryFromFirebase(), this.loadHhs()]);
    this.cdr.detectChanges();
  }

  // ─── Tính ngày ───────────────────────────────────────────

  private computeDays(): void {
    const today = new Date();
    this.totalDaysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    if (
      today.getMonth() + 1 === this.selectedMonth &&
      today.getFullYear() === this.selectedYear
    ) {
      this.daysElapsed = today.getDate();
    } else if (
      this.selectedYear < today.getFullYear() ||
      (this.selectedYear === today.getFullYear() && this.selectedMonth < today.getMonth() + 1)
    ) {
      this.daysElapsed = this.totalDaysInMonth;
    } else {
      this.daysElapsed = 1;
    }
  }

  // ─────────────────────────────────────────────────────────
  // BƯỚC 1: ĐỌC TỒN KHO TỪ FIREBASE (HOẶC API)
  // ─────────────────────────────────────────────────────────

  private async loadInventoryFromFirebase(): Promise<void> {
    this.isInventoryLoading = true;
    this.loadingTitle = "Đang tải dữ liệu tồn kho...";
    this.loadingProgressPercent = 10;
    this.cdr.detectChanges();

    try {
      this.shopList = this.upharma.getActiveShops() || [];
      const shopCodes = this.shopList.map((s) => s.ShopCode);

      // Tải tồn kho cho tất cả nhà thuốc
      const response = await this.upharma.loadInventoryResource({
        shopCodes,
        forceRefresh: false,
      });
      this.loadingProgressPercent = 80;

      this.buildShopSummaries(this.shopList, response.data || []);

      if (!this.activeShopCode && this.shopList.length > 0) {
        this.activeShopCode = this.shopList[0].ShopCode;
      }

      this.loadingProgressPercent = 100;
    } catch (err) {
      this.errorText = `Lỗi tải tồn kho: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      this.isInventoryLoading = false;
      this.loadingTitle = "";
      this.loadingProgressPercent = 0;
      this.cdr.detectChanges();
    }
  }

  // ─── Tải dữ liệu riêng cho 1 nhà thuốc khi chuyển chọn ───

  private async fetchSingleShopData(shopCode: string): Promise<void> {
    const firebaseDbUrl = (environment as any).firebaseDbUrl as string | undefined;
    const normalizedFirebase = firebaseDbUrl ? firebaseDbUrl.replace(/\/$/, "") : "";

    // 1. Tải tồn kho riêng từ Firebase
    let inventoryRows: RawRecord[] = [];
    if (normalizedFirebase) {
      try {
        const res = await fetch(`${normalizedFirebase}/shops/${shopCode}/upharma_data/inventory.json`);
        if (res.ok) {
          const json = await res.json();
          if (json) {
            if (Array.isArray(json)) inventoryRows = json;
            else if (Array.isArray(json.data)) inventoryRows = json.data;
            else if (json.data && typeof json.data === "object") inventoryRows = Object.values(json.data);
          }
        }
      } catch (err) {
        console.warn(`[Inventory] Lỗi đọc Firebase cho shop ${shopCode}:`, err);
      }
    }

    // 2. Nếu Firebase chưa có, gọi API trực tiếp
    if (inventoryRows.length === 0) {
      try {
        const session = this.upharma.getSession();
        if (session) {
          const apiRes = await this.callInventoryApi(session, shopCode);
          const rawList: RawRecord[] = this.extractArray(apiRes).map((item) => ({
            ...item,
            __shopCode: shopCode,
            ShopCode: shopCode,
          }));
          inventoryRows = rawList.filter((item: any) => {
            if (isWarehouseStore(item)) return false;
            const nameStr = String(item["ProductName"] || item["Product_Name"] || item["TenSP"] || "").toLowerCase();
            const codeStr = String(item["ProductCode"] || item["ProductID"] || item["MaSP"] || "").toLowerCase();
            return !nameStr.includes("voucher") && !codeStr.includes("voucher");
          });
        }
      } catch (err) {
        console.warn(`[Inventory] Lỗi gọi API trực tiếp cho shop ${shopCode}:`, err);
      }
    }

    if (inventoryRows.length > 0) {
      this.updateSingleShopInventory(shopCode, inventoryRows);
    }

    // 3. Tải HHS riêng cho shop này
    await this.fetchSingleShopHhs(shopCode);
  }

  private updateSingleShopInventory(shopCode: string, rows: RawRecord[]): void {
    const shop = this.shopList.find((s) => s.ShopCode === shopCode);
    const shopName = shop?.ShopName || shopCode;

    const products = new Set<string>();
    let totalValue = 0;
    const expired = { count: new Set<string>(), value: 0 };
    const danger = { count: new Set<string>(), value: 0 };
    const warning = { count: new Set<string>(), value: 0 };
    const safe = { count: new Set<string>(), value: 0 };
    const normal = { count: new Set<string>(), value: 0 };

    for (let i = 0; i < rows.length; i++) {
      const item = normalizeInventoryRow(rows[i], i);
      const key = item.productCode.trim() || item.rowKey;
      const val = Number(item.stockValue) || 0;
      const days = item.expiryDaysRemaining;

      products.add(key);
      totalValue += val;

      if (days === null || days > UNDER_12_MONTHS_DAYS) {
        normal.count.add(key);
        normal.value += val;
      } else if (days < 0) {
        expired.count.add(key);
        expired.value += val;
      } else if (days <= UNDER_3_MONTHS_DAYS) {
        danger.count.add(key);
        danger.value += val;
      } else if (days <= UNDER_6_MONTHS_DAYS) {
        warning.count.add(key);
        warning.value += val;
      } else {
        safe.count.add(key);
        safe.value += val;
      }
    }

    const tv = totalValue || 0;
    const safeTv = tv || 1;
    const pct = (v: number) => ((v / safeTv) * 100).toFixed(2).replace(".", ",");

    const updated: ShopInventorySummary = {
      shopCode,
      shopName,
      totalProducts: products.size,
      totalValue: tv,
      expiredCount: expired.count.size,
      expiredValue: expired.value,
      expiredRate: pct(expired.value),
      dangerCount: danger.count.size,
      dangerValue: danger.value,
      dangerRate: pct(danger.value),
      warningCount: warning.count.size,
      warningValue: warning.value,
      warningRate: pct(warning.value),
      safeCount: safe.count.size,
      safeValue: safe.value,
      safeRate: pct(safe.value),
      normalCount: normal.count.size,
      normalValue: normal.value,
      normalRate: pct(normal.value),
    };

    const idx = this.shopSummaries.findIndex((s) => s.shopCode === shopCode);
    if (idx >= 0) {
      this.shopSummaries[idx] = updated;
    } else {
      this.shopSummaries.push(updated);
    }
  }

  private async fetchSingleShopHhs(shopCode: string): Promise<void> {
    try {
      const session = this.upharma.ensureLogin();
      const shop = this.shopList.find((s) => s.ShopCode === shopCode);
      const shopName = shop?.ShopName || shopCode;

      const year = this.selectedYear;
      const monthStr = String(this.selectedMonth).padStart(2, "0");
      const targetMonth = `${year}-${monthStr}`;

      const res = await this.upharma.loadShopPlanByTime({
        TimeStart: `${year}-01-01 00:00:00`,
        TimeEnd: `${year}-12-31 23:59:59`,
        ShopCode: shopCode,
        Token: session.Token,
        uPharmaID: session.UserInfo.uPharmaID,
      });

      const items: ShopPlanApiItem[] = (res.ShopPlanLst || []).filter((item) => {
        const m = String(item.Month || item.TimeMonth || "");
        return m.includes("-") ? m === targetMonth : Number(m) === this.selectedMonth;
      });

      const amount = items.reduce((s, i) => s + (Number(i.Amount) || 0), 0);
      const amountR = items.reduce((s, i) => s + (Number(i.AmountR) || 0), 0);
      const hhs = items.reduce((s, i) => s + (Number(i.PointSales01) || 0), 0);
      const hhsR = items.reduce((s, i) => s + (Number(i.PointSales01R) || 0), 0);

      const updated: ShopHhsSummary = {
        shopCode,
        shopName,
        amount,
        amountR,
        hhs,
        hhsR,
        salesPercent: amount > 0 ? (amountR / amount) * 100 : 0,
        hhsRatio: amountR > 0 ? ((hhsR * 1000) / amountR) * 100 : 0,
        hhsRatioTarget: amount > 0 ? ((hhs * 1000) / amount) * 100 : 0,
        hhsPercent: hhs > 0 ? (hhsR / hhs) * 100 : 0,
        projectedAmount: this.daysElapsed > 0 ? (amountR / this.daysElapsed) * this.totalDaysInMonth : 0,
      };

      const idx = this.hhsSummaries.findIndex((h) => h.shopCode === shopCode);
      if (idx >= 0) {
        this.hhsSummaries[idx] = updated;
      } else {
        this.hhsSummaries.push(updated);
      }
    } catch (err) {
      console.warn(`[HHS] Lỗi tải HHS riêng cho ${shopCode}:`, err);
    }
  }

  // ─────────────────────────────────────────────────────────
  // BƯỚC 2: GỌI API → ĐẨY LÊN FIREBASE (nút "Đồng bộ")
  // ─────────────────────────────────────────────────────────

  async syncToFirebase(): Promise<void> {
    this.isSyncing = true;
    this.syncStatus = "Đang xử lý...";
    this.errorText = "";
    this.successText = "";
    this.syncLogs = [];
    this.cdr.detectChanges();

    try {
      const session = this.upharma.ensureLogin();
      const shops = this.shopList.length > 0 ? this.shopList : this.upharma.getActiveShops();
      const firebaseDbUrl = (environment as any).firebaseDbUrl as string | undefined;

      if (!firebaseDbUrl) {
        throw new Error("Chưa cấu hình firebaseDbUrl trong environment");
      }

      const normalizedFirebase = firebaseDbUrl.replace(/\/$/, "");
      const allInventoryData: RawRecord[] = [];
      let successCount = 0;
      let failCount = 0;

      this.addLog(`Bắt đầu đồng bộ ${shops.length} nhà thuốc...`, "info");

      for (const shop of shops) {
        this.syncStatus = `${shop.ShopCode}...`;
        this.cdr.detectChanges();

        try {
          this.addLog(`[${shop.ShopCode}] Gọi API GetInventoryShop...`, "info");
          const response = await this.callInventoryApi(session, shop.ShopCode);
          const rawItems: RawRecord[] = this.extractArray(response).map((item) => ({
            ...item,
            __shopCode: shop.ShopCode,
            __shopName: shop.ShopName,
            ShopCode: shop.ShopCode,
            ShopName: shop.ShopName,
          }));

          const filtered = rawItems.filter((item) => {
            if (isWarehouseStore(item)) return false;
            const nameStr = String(item["ProductName"] || item["Product_Name"] || item["TenSP"] || "").toLowerCase();
            const codeStr = String(item["ProductCode"] || item["ProductID"] || item["MaSP"] || "").toLowerCase();
            return !nameStr.includes("voucher") && !codeStr.includes("voucher");
          });

          this.addLog(`[${shop.ShopCode}] Lấy được ${filtered.length} dòng (gốc: ${rawItems.length})`, "info");

          const firebasePath = `${normalizedFirebase}/shops/${shop.ShopCode}/upharma_data/inventory.json`;
          const payload = {
            data: filtered,
            updatedAt: Date.now(),
            fetchedAt: new Date().toISOString(),
            shopCode: shop.ShopCode,
            shopName: shop.ShopName,
            count: filtered.length,
          };

          const putRes = await fetch(firebasePath, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!putRes.ok) {
            throw new Error(`HTTP ${putRes.status} khi đẩy lên Firebase`);
          }

          this.addLog(`[${shop.ShopCode}] ✓ Đẩy ${filtered.length} dòng lên Firebase thành công`, "success");
          allInventoryData.push(...filtered);
          successCount++;
        } catch (shopErr) {
          const msg = shopErr instanceof Error ? shopErr.message : String(shopErr);
          this.addLog(`[${shop.ShopCode}] ✗ Lỗi: ${msg}`, "error");
          failCount++;
        }
      }

      if (allInventoryData.length > 0) {
        this.buildShopSummaries(shops, allInventoryData);
      }

      const summary = `Hoàn tất: ${successCount} thành công, ${failCount} lỗi`;
      this.addLog(summary, failCount > 0 ? "error" : "success");
      this.successText = `${summary}. Dữ liệu đã được cập nhật lên Firebase!`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.errorText = `Lỗi đồng bộ: ${msg}`;
      this.addLog(`Lỗi chung: ${msg}`, "error");
    } finally {
      this.isSyncing = false;
      this.syncStatus = "";
      this.cdr.detectChanges();

      if (this.successText) {
        setTimeout(() => {
          this.successText = "";
          this.cdr.detectChanges();
        }, 5000);
      }
    }
  }

  // ─── Gọi API tồn kho trực tiếp ──────────────────────────

  private async callInventoryApi(session: any, shopCode: string): Promise<any> {
    const apiBase = (environment as any).directApiBaseUrl || (environment as any).apiBaseUrl;
    const url = `${apiBase}/LocalStore/GetInventoryShop`;

    const body = {
      uPharmaID: session.UserInfo.uPharmaID,
      Token: session.Token,
      ShopCode: shopCode,
      BranchLst: "",
      ProductID: "",
      LotCode: "",
      PackageID: null,
      StoreType: "",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} từ GetInventoryShop`);
    }

    return res.json();
  }

  private extractArray(response: any): RawRecord[] {
    if (Array.isArray(response)) return response;
    const keys = ["InventoryLst", "data", "Data", "items", "Items", "result", "Result"];
    for (const key of keys) {
      if (Array.isArray(response?.[key])) return response[key];
    }
    return [];
  }

  // ─── HHS ─────────────────────────────────────────────────

  private async loadHhs(): Promise<void> {
    this.isHhsLoading = true;
    this.cdr.detectChanges();

    try {
      const shops = this.shopList.length > 0 ? this.shopList : this.upharma.getActiveShops();
      const session = this.upharma.ensureLogin();

      const year = this.selectedYear;
      const monthStr = String(this.selectedMonth).padStart(2, "0");
      const targetMonth = `${year}-${monthStr}`;

      const results = await Promise.all(
        shops.map(async (shop) => {
          try {
            const res = await this.upharma.loadShopPlanByTime({
              TimeStart: `${year}-01-01 00:00:00`,
              TimeEnd: `${year}-12-31 23:59:59`,
              ShopCode: shop.ShopCode,
              Token: session.Token,
              uPharmaID: session.UserInfo.uPharmaID,
            });

            const items: ShopPlanApiItem[] = (res.ShopPlanLst || []).filter((item) => {
              const m = String(item.Month || item.TimeMonth || "");
              return m.includes("-") ? m === targetMonth : Number(m) === this.selectedMonth;
            });

            return { shop, items };
          } catch {
            return { shop, items: [] };
          }
        }),
      );

      const summaries: ShopHhsSummary[] = [];
      for (const { shop, items } of results) {
        const amount = items.reduce((s, i) => s + (Number(i.Amount) || 0), 0);
        const amountR = items.reduce((s, i) => s + (Number(i.AmountR) || 0), 0);
        const hhs = items.reduce((s, i) => s + (Number(i.PointSales01) || 0), 0);
        const hhsR = items.reduce((s, i) => s + (Number(i.PointSales01R) || 0), 0);

        summaries.push({
          shopCode: shop.ShopCode,
          shopName: shop.ShopName || shop.ShopCode,
          amount,
          amountR,
          hhs,
          hhsR,
          salesPercent: amount > 0 ? (amountR / amount) * 100 : 0,
          hhsRatio: amountR > 0 ? ((hhsR * 1000) / amountR) * 100 : 0,
          hhsRatioTarget: amount > 0 ? ((hhs * 1000) / amount) * 100 : 0,
          hhsPercent: hhs > 0 ? (hhsR / hhs) * 100 : 0,
          projectedAmount: this.daysElapsed > 0 ? (amountR / this.daysElapsed) * this.totalDaysInMonth : 0,
        });
      }

      this.hhsSummaries = summaries;
    } catch (err) {
      console.error("[HHS]", err);
    } finally {
      this.isHhsLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Build shop summaries từ raw data ───────────────────

  private buildShopSummaries(shops: ShopInfo[], rawData: RawRecord[]): void {
    const shopMap = new Map<string, {
      info: ShopInfo;
      products: Set<string>;
      totalValue: number;
      expired: { count: Set<string>; value: number };
      danger: { count: Set<string>; value: number };
      warning: { count: Set<string>; value: number };
      safe: { count: Set<string>; value: number };
      normal: { count: Set<string>; value: number };
    }>();

    for (const shop of shops) {
      shopMap.set(shop.ShopCode, {
        info: shop,
        products: new Set(),
        totalValue: 0,
        expired: { count: new Set(), value: 0 },
        danger: { count: new Set(), value: 0 },
        warning: { count: new Set(), value: 0 },
        safe: { count: new Set(), value: 0 },
        normal: { count: new Set(), value: 0 },
      });
    }

    for (let i = 0; i < rawData.length; i++) {
      const raw = rawData[i];
      const item = normalizeInventoryRow(raw, i);
      const entry = shopMap.get(item.shopCode);
      if (!entry) continue;

      const key = item.productCode.trim() || item.rowKey;
      const val = Number(item.stockValue) || 0;
      const days = item.expiryDaysRemaining;

      entry.products.add(key);
      entry.totalValue += val;

      if (days === null || days > UNDER_12_MONTHS_DAYS) {
        entry.normal.count.add(key);
        entry.normal.value += val;
      } else if (days < 0) {
        entry.expired.count.add(key);
        entry.expired.value += val;
      } else if (days <= UNDER_3_MONTHS_DAYS) {
        entry.danger.count.add(key);
        entry.danger.value += val;
      } else if (days <= UNDER_6_MONTHS_DAYS) {
        entry.warning.count.add(key);
        entry.warning.value += val;
      } else {
        entry.safe.count.add(key);
        entry.safe.value += val;
      }
    }

    this.shopSummaries = Array.from(shopMap.values())
      .map((e) => {
        const tv = e.totalValue || 0;
        const safeTv = tv || 1;
        const pct = (v: number) => ((v / safeTv) * 100).toFixed(2).replace(".", ",");
        return {
          shopCode: e.info.ShopCode,
          shopName: e.info.ShopName || e.info.ShopCode,
          totalProducts: e.products.size,
          totalValue: tv,
          expiredCount: e.expired.count.size,
          expiredValue: e.expired.value,
          expiredRate: pct(e.expired.value),
          dangerCount: e.danger.count.size,
          dangerValue: e.danger.value,
          dangerRate: pct(e.danger.value),
          warningCount: e.warning.count.size,
          warningValue: e.warning.value,
          warningRate: pct(e.warning.value),
          safeCount: e.safe.count.size,
          safeValue: e.safe.value,
          safeRate: pct(e.safe.value),
          normalCount: e.normal.count.size,
          normalValue: e.normal.value,
          normalRate: pct(e.normal.value),
        };
      })
      .sort((a, b) => a.shopCode.localeCompare(b.shopCode, "vi"));
  }

  private addLog(message: string, type: SyncLog["type"]): void {
    this.syncLogs.push({ message, type });
    this.cdr.detectChanges();
  }
}
