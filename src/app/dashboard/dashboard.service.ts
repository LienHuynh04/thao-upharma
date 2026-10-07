import { Injectable } from '@angular/core';
import { ShopInfo, UpharmaService, ShopPlanApiItem } from '../upharma.service';

export interface DashboardShopItem {
  province: string;
  code: string;
  name: string;
  target: number;
  actual: number;
  pctDS: number;
  projectedSales: number;
  pctDK: number;
  hhsActual: number;
  hhsTarget: number;
  hhsRatioPct: number;
  invoices: number;
  avgInvoiceValue: number;
  itemsPerInvoice: number;
  statusText: string;
  hasPlanData: boolean;
}

export interface DashboardOverviewResult {
  actualSales: number;
  targetSales: number;
  projectedSales: number;
  salesPercent: number;
  daNangSales: number;
  daNangSalesPct: number;
  daNangTarget: number;
  hueSales: number;
  hueSalesPct: number;
  hueTarget: number;
  otherSales: number;
  otherSalesPct: number;
  otherTarget: number;
  actualHHS: number;
  targetHHS: number;
  projectedHHS: number;
  hhsPercent: number;
  hhsRatioPct: number | null;
  daNangHHS: number;
  daNangHHSPct: number;
  daNangHHSTarget: number;
  hueHHS: number;
  hueHHSPct: number;
  hueHHSTarget: number;
  otherHHS: number;
  otherHHSPct: number;
  otherHHSTarget: number;
  tbnPerShop: number;
  totalInvoices: number;
  avgInvoiceValue: number;
  itemsPerInvoice: number;
  daNangProjectedSales: number;
  daNangProjectedHHS: number;
  daNangHHSRatioPct: number;
  daNangInvoices: number;
  otherInvoices: number;
  hueProjectedSales: number;
  hueProjectedHHS: number;
  hueHHSRatioPct: number;
  hueInvoices: number;
  shopsWithPlanData: number;
  shopList: DashboardShopItem[];
}

export interface ManagedEmployeeSummary {
  total: number;
  storeManagers: number;
  salesRepresentatives: number;
}

type ManagedEmployee = Record<string, unknown>;
type EmployeePlan = Record<string, unknown>;

interface HhsTotals {
  actual: number;
  target: number;
  salesActual: number;
  hasPlanData: boolean;
}

const KNOWN_SHOP_REGION_BY_CODE: Record<string, string> = {
  SHOP0010: 'ĐÀ',
  SHOP0022: 'ĐÀ',
  SHOP0025: 'ĐÀ',
  SHOP0040: 'ĐÀ',
  SHOP0043: 'ĐÀ',
  SHOP0046: 'ĐÀ',
  SHOP0097: 'ĐÀ',
  SHOP0119: 'HU',
  SHOP0120: 'HU',
  SHOP0133: 'HU',
  SHOP0144: 'ĐÀ',
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardCache = new Map<string, DashboardOverviewResult>();
  private inFlightFetch = new Map<string, Promise<DashboardOverviewResult>>();

  constructor(private upharma: UpharmaService) {}

  async getManagedEmployeeSummary(): Promise<ManagedEmployeeSummary> {
    const session = this.upharma.getSession();
    if (!session) {
      throw new Error('No authenticated session is available.');
    }
    const shops = session.UserInfo.ShopLst;
    if (!Array.isArray(shops)) {
      throw new Error('The signed-in user has no valid managed shop list.');
    }

    const uniqueShops = [...new Map(shops.filter(shop => shop.ShopCode).map(shop => [shop.ShopCode, shop])).values()];
    const results: PromiseSettledResult<ManagedEmployee[]>[] = [];
    for (const shop of uniqueShops) {
      try {
        const response = await this.upharma.callEndpoint<{ EmployeeLst?: ManagedEmployee[] }>(
          '/Employee/GetEmployeeOfShop',
          {
            uPharmaID: session.UserInfo.uPharmaID,
            Token: session.Token,
            ShopCode: shop.ShopCode
          },
          { cache: true }
        );
        if (!Array.isArray(response?.EmployeeLst)) {
          throw new Error(`Invalid employee response for ${shop.ShopCode}.`);
        }
        results.push({
          status: 'fulfilled',
          value: response.EmployeeLst.map((employee) => ({
          ...employee,
          ShopCode: employee['ShopCode'] || shop.ShopCode
          }))
        });
      } catch (reason) {
        results.push({ status: 'rejected', reason });
      }
    }

    const failedShops = results.flatMap((result, index) =>
      result.status === 'rejected' ? [uniqueShops[index].ShopCode] : []
    );
    if (failedShops.length > 0) {
      throw new Error(`Could not load employees for: ${failedShops.join(', ')}`);
    }

    const employees = results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : []
    );
    const uniqueEmployees = new Map<string, ManagedEmployee>();
    employees.forEach((employee) => {
      const key = String(
        employee['EmployeeID'] ||
        employee['EmployeeCode'] ||
        employee['EmCode'] ||
        employee['uPharmaID'] ||
        `${employee['ShopCode']}:${employee['EmployeeName'] || employee['FullName'] || ''}`
      );
      if (!uniqueEmployees.has(key)) uniqueEmployees.set(key, employee);
    });

    const activeEmployees = [...uniqueEmployees.values()].filter((employee) => {
      const resigned = employee['IsResign'];
      return resigned !== true && Number(resigned) !== 1 && String(resigned).toLowerCase() !== 'true';
    });
    const storeManagers = activeEmployees.filter((employee) => {
      const role = String(employee['RoleName'] || employee['UTypeTxt'] || '').toLowerCase();
      return role.includes('cửa hàng trưởng') || role.includes('cht');
    }).length;

    return {
      total: activeEmployees.length,
      storeManagers,
      salesRepresentatives: activeEmployees.length - storeManagers
    };
  }

  public clearCache() {
    this.dashboardCache.clear();
  }

  public getDashboardShops(shops: ShopInfo[] = this.upharma.ensureLogin().UserInfo.ShopLst) {
    const uniqueShops = new Map(
      (shops || []).filter(shop => shop.ShopCode).map(shop => [shop.ShopCode, shop])
    );
    return [...uniqueShops.values()].map(shop => ({
      province: this.getShopProvince(shop),
      code: shop.ShopCode,
      name: shop.ShopName || shop.ShopCode
    }));
  }

  private getShopProvince(shop: Pick<ShopInfo, 'ShopCode' | 'ShopName' | 'ShopAddress'>): string {
    const location = `${shop.ShopName || ''} ${shop.ShopAddress || ''}`.toLowerCase();
    if (location.includes('đà nẵng') || location.includes('da nang')) return 'ĐÀ';
    if (location.includes('huế') || location.includes('hue')) return 'HU';
    if (KNOWN_SHOP_REGION_BY_CODE[shop.ShopCode]) return KNOWN_SHOP_REGION_BY_CODE[shop.ShopCode];
    return 'KH';
  }

  private calculateHhsRatioPct(hhsAmount: number, salesAmount: number): number {
    return salesAmount > 0
      ? Math.round((hhsAmount / salesAmount) * 1000) / 10
      : 0;
  }

  public getTimeRange(filterMode: 'month' | 'quarter' | 'year', selectedMonth: number, selectedYear: number): { timeStart: string; timeEnd: string } {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = selectedYear;

    if (filterMode === 'month') {
      const month = selectedMonth;
      const lastDay = new Date(year, month, 0).getDate();
      return {
        timeStart: `${year}-${pad(month)}-01 00:00:00`,
        timeEnd: `${year}-${pad(month)}-${pad(lastDay)} 23:59:59`
      };
    } else if (filterMode === 'quarter') {
      const q = Math.ceil(selectedMonth / 3);
      const startM = (q - 1) * 3 + 1;
      const endM = startM + 2;
      const lastDay = new Date(year, endM, 0).getDate();
      return {
        timeStart: `${year}-${pad(startM)}-01 00:00:00`,
        timeEnd: `${year}-${pad(endM)}-${pad(lastDay)} 23:59:59`
      };
    } else {
      return {
        timeStart: `${year}-01-01 00:00:00`,
        timeEnd: `${year}-12-31 23:59:59`
      };
    }
  }

  public getSelectedMonths(filterMode: 'month' | 'quarter' | 'year', selectedMonth: number): number[] {
    if (filterMode === 'quarter') {
      const q = Math.ceil(selectedMonth / 3);
      const startM = (q - 1) * 3 + 1;
      return [startM, startM + 1, startM + 2];
    } else if (filterMode === 'year') {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    return [selectedMonth];
  }

  public async fetchDashboardData(
    filterMode: 'month' | 'quarter' | 'year',
    selectedMonth: number,
    selectedYear: number,
    forceRefresh = false
  ): Promise<DashboardOverviewResult> {
    const session = this.upharma.ensureLogin();
    const dashboardShops = this.getDashboardShops(session.UserInfo.ShopLst);
    const scopeKey = dashboardShops.map(shop => shop.code).sort().join(',');
    const cacheKey = `${session.UserInfo.uPharmaID}_${scopeKey}_${filterMode}_${selectedMonth}_${selectedYear}`;

    if (!forceRefresh && this.dashboardCache.has(cacheKey)) {
      return this.dashboardCache.get(cacheKey)!;
    }

    if (this.inFlightFetch.has(cacheKey)) {
      return this.inFlightFetch.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
        const { timeStart, timeEnd } = this.getTimeRange(filterMode, selectedMonth, selectedYear);
        const shopCodes = dashboardShops.map(shop => shop.code);

        if (shopCodes.length === 0) {
          throw new Error('Không tìm thấy nhà thuốc được phân quyền cho tài khoản này.');
        }

        const shopPlansMap = new Map<string, ShopPlanApiItem[]>();
        const responses: PromiseSettledResult<void>[] = [];
        for (let index = 0; index < shopCodes.length; index += 4) {
          const batch = shopCodes.slice(index, index + 4);
          responses.push(...await Promise.allSettled(batch.map(async shopCode => {
            const response = await this.upharma.callEndpoint<any>('/ShopPlan/GetShopPlanByTime', {
              TimeStart: timeStart,
              TimeEnd: timeEnd,
              ShopCode: shopCode,
              Token: session.Token,
              uPharmaID: String(session.UserInfo.uPharmaID),
            });
            if (response?.RespCode === -1) {
              throw new Error('Phiên đăng nhập Upharma đã hết hạn.');
            }
            if (!Array.isArray(response?.ShopPlanLst)) {
              throw new Error(`Phản hồi chỉ tiêu không hợp lệ cho ${shopCode}.`);
            }
            if (response.ShopPlanLst.some((plan: ShopPlanApiItem) => plan.ShopCode && plan.ShopCode !== shopCode)) {
              throw new Error(`Dữ liệu chỉ tiêu trả sai nhà thuốc cho ${shopCode}.`);
            }
            shopPlansMap.set(shopCode, response.ShopPlanLst);
          })));
        }

        const failedShops = responses.flatMap((response, index) =>
          response.status === 'rejected' ? [shopCodes[index]] : []
        );
        if (failedShops.length > 0) {
          const hasExpiredSession = responses.some(
            response => response.status === 'rejected' && String(response.reason?.message || '').includes('hết hạn')
          );
          const reason = hasExpiredSession ? 'Phiên đăng nhập Upharma đã hết hạn' : 'Không tải đủ dữ liệu chỉ tiêu';
          throw new Error(`${reason} (${shopCodes.length - failedShops.length}/${shopCodes.length} nhà thuốc). Lỗi: ${failedShops.join(', ')}.`);
        }

        const targetMonths = this.getSelectedMonths(filterMode, selectedMonth);
        const employeeHhsFallbacks = await this.fetchEmployeeHhsFallbacks(
          shopPlansMap,
          dashboardShops,
          targetMonths,
          selectedYear,
          session
        );
        const result = this.processApiData(
          shopPlansMap,
          employeeHhsFallbacks,
          filterMode,
          selectedMonth,
          selectedYear,
          dashboardShops
        );
        this.dashboardCache.set(cacheKey, result);
        return result;
      } finally {
        this.inFlightFetch.delete(cacheKey);
      }
    })();

    this.inFlightFetch.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  private findItemsForPeriod(plans: ShopPlanApiItem[], months: number[], year: number): ShopPlanApiItem[] {
    return plans.filter(p => {
      let mNum = 0;
      if (typeof p.Month === 'number') {
        mNum = p.Month;
      } else if (typeof p.Month === 'string') {
        const dateMatch = p.Month.match(/^\d{4}-(\d{1,2})(?:-|$)/);
        const numericMatch = p.Month.match(/^(\d{1,2})$/);
        if (dateMatch) mNum = parseInt(dateMatch[1], 10);
        else if (numericMatch) mNum = parseInt(numericMatch[1], 10);
      }
      if (!mNum && p.TimeMonth) mNum = p.TimeMonth;
      if (!mNum && p.TimeStart) {
        const d = new Date(p.TimeStart);
        if (!isNaN(d.getTime())) mNum = d.getMonth() + 1;
      }

      let yNum = 0;
      if (p.Year) yNum = p.Year;
      else if (p.TimeYear) yNum = p.TimeYear;
      else if (p.TimeStart) {
        const d = new Date(p.TimeStart);
        if (!isNaN(d.getTime())) yNum = d.getFullYear();
      } else if (typeof p.Month === 'string') {
        const match = p.Month.match(/^(\d{4})-/);
        if (match) yNum = parseInt(match[1], 10);
      }

      const monthMatches = months.includes(mNum);
      const yearMatches = !yNum || yNum === year;
      return monthMatches && yearMatches;
    });
  }

  private async fetchEmployeeHhsFallbacks(
    shopPlansMap: Map<string, ShopPlanApiItem[]>,
    dashboardShops: ReturnType<DashboardService['getDashboardShops']>,
    months: number[],
    year: number,
    session: ReturnType<UpharmaService['ensureLogin']>
  ): Promise<Map<string, HhsTotals>> {
    const shopsNeedingFallback = dashboardShops.map((shop) => ({
      shop,
      missingMonths: months.flatMap((month) => {
        const plans = this.findItemsForPeriod(shopPlansMap.get(shop.code) || [], [month], year);
        const hasPlan = plans.length > 0;
        const sales = plans.reduce((sum, item) => sum + (Number(item.AmountR) || 0), 0);
        const actual = plans.reduce((sum, item) =>
          sum + (Number(item.PointSales01R) || Number(item.PointRatioR) || 0), 0);
        const target = plans.reduce((sum, item) =>
          sum + (Number(item.PointSales01) || Number(item.QuantityHHS) || 0), 0);
        return !hasPlan || sales === 0 || actual === 0 || target === 0
          ? [{
              month,
              missingSalesActual: !hasPlan || sales === 0,
              missingActual: actual === 0,
              missingTarget: target === 0
            }]
          : [];
      })
    })).filter(({ missingMonths }) => missingMonths.length > 0);
    const fallbacks = new Map<string, HhsTotals>();

    for (let index = 0; index < shopsNeedingFallback.length; index += 2) {
      const batch = shopsNeedingFallback.slice(index, index + 2);
      const results = await Promise.all(batch.map(async ({ shop, missingMonths }) => {
        const totals: HhsTotals = { actual: 0, target: 0, salesActual: 0, hasPlanData: false };
        for (const { month, missingSalesActual, missingActual, missingTarget } of missingMonths) {
          try {
            const response = await this.upharma.callEndpoint<{ EmployeePlanLst?: EmployeePlan[] }>(
              '/EmployeePlan/GetEmployeePlanLst',
              {
                Month: month,
                Year: year,
                Token: session.Token,
                uPharmaID: String(session.UserInfo.uPharmaID),
                ShopCode: shop.code
              }
            );
            if (!Array.isArray(response?.EmployeePlanLst)) {
              throw new Error('Phản hồi danh sách chỉ tiêu nhân viên không hợp lệ.');
            }
            if (response.EmployeePlanLst.length > 0) totals.hasPlanData = true;
            response.EmployeePlanLst.forEach((employeePlan) => {
              if (missingSalesActual) totals.salesActual += Number(employeePlan['AmountR']) || 0;
              if (missingActual) totals.actual += Number(employeePlan['PointRatioR']) || 0;
              if (missingTarget) totals.target += Number(employeePlan['PointRatio']) || 0;
            });
          } catch (error) {
            const reason = error instanceof Error ? error.message : 'Lỗi không xác định';
            throw new Error(`Không tải được HHS nhân viên của ${shop.code} tháng ${month}/${year}: ${reason}`);
          }
        }
        return [shop.code, totals] as const;
      }));
      results.forEach(([shopCode, totals]) => fallbacks.set(shopCode, totals));
    }

    return fallbacks;
  }

  private processApiData(
    shopPlansMap: Map<string, ShopPlanApiItem[]>,
    employeeHhsFallbacks: Map<string, HhsTotals>,
    filterMode: 'month' | 'quarter' | 'year',
    selectedMonth: number,
    selectedYear: number,
    dashboardShops: ReturnType<DashboardService['getDashboardShops']>
  ): DashboardOverviewResult {
    let actualSales = 0;
    let targetSales = 0;
    let actualHHS = 0;
    let targetHHS = 0;
    let daNangSales = 0;
    let daNangTarget = 0;
    let hueSales = 0;
    let hueTarget = 0;
    let otherSales = 0;
    let otherTarget = 0;
    let daNangHHS = 0;
    let daNangHHSTarget = 0;
    let hueHHS = 0;
    let hueHHSTarget = 0;
    let otherHHS = 0;
    let otherHHSTarget = 0;
    let totalInvoices = 0;
    let daNangInvoices = 0;
    let hueInvoices = 0;
    let otherInvoices = 0;
    let totalItems = 0;
    let shopsWithPlanData = 0;

    const targetMonths = this.getSelectedMonths(filterMode, selectedMonth);

    const shopList: DashboardShopItem[] = [];

    dashboardShops.forEach((shopDef) => {
      const plans = shopPlansMap.get(shopDef.code) || [];
      const periodItems = this.findItemsForPeriod(plans, targetMonths, selectedYear);
      let amtTarget = 0;
      let amtReal = 0;
      let hhsTarget = 0;
      let hhsReal = 0;
      let invCount = 0;
      let statusApproved = false;
      let itemCount = 0;

      periodItems.forEach(item => {
        amtTarget += Number(item.Amount) || 0;
        amtReal += Number(item.AmountR) || 0;
        hhsTarget += Number(item.PointSales01) || Number(item.QuantityHHS) || 0;
        hhsReal += Number(item.PointSales01R) || Number(item.PointRatioR) || 0;
        invCount += Number(item.QuaInvoiceR ?? item.QuaInvoice) || 0;
        itemCount += Number(item.SKUR ?? item.SKU) || 0;
        if (item.Status === 1 || item.ApproveStatus === 1) {
          statusApproved = true;
        }
      });
      const employeeHhs = employeeHhsFallbacks.get(shopDef.code);
      if (employeeHhs) {
        amtReal += employeeHhs.salesActual;
        hhsTarget += employeeHhs.target;
        hhsReal += employeeHhs.actual;
      }
      if (periodItems.length > 0 || employeeHhs?.hasPlanData) shopsWithPlanData++;

      const pctDS = amtTarget > 0 ? Math.round((amtReal / amtTarget) * 100) : 0;
      const projectedSales = amtReal;
      const pctDK = amtTarget > 0 ? Math.round((projectedSales / amtTarget) * 100) : 0;
      const hhsRatioPct = this.calculateHhsRatioPct(hhsReal, amtReal);
      const avgInvoiceValue = invCount > 0 ? Math.round(amtReal / invCount) : 0;

      shopList.push({
        ...shopDef,
        target: amtTarget,
        actual: amtReal,
        pctDS,
        projectedSales,
        pctDK,
        hhsTarget,
        hhsActual: hhsReal,
        hhsRatioPct,
        invoices: invCount,
        avgInvoiceValue,
        itemsPerInvoice: invCount > 0 ? Number((itemCount / invCount).toFixed(1)) : 0,
        statusText: periodItems.length === 0 ? 'Không có chỉ tiêu' : (statusApproved ? 'Đã duyệt' : 'Chưa duyệt'),
        hasPlanData: periodItems.length > 0
      });

      targetSales += amtTarget;
      actualSales += amtReal;
      targetHHS += hhsTarget;
      actualHHS += hhsReal;
      totalInvoices += invCount;

      const isHue = shopDef.province === 'HU';
      if (isHue) {
        hueSales += amtReal;
        hueTarget += amtTarget;
        hueHHS += hhsReal;
        hueHHSTarget += hhsTarget;
        hueInvoices += invCount;
      } else if (shopDef.province === 'ĐÀ') {
        daNangSales += amtReal;
        daNangTarget += amtTarget;
        daNangHHS += hhsReal;
        daNangHHSTarget += hhsTarget;
        daNangInvoices += invCount;
      } else {
        otherSales += amtReal;
        otherTarget += amtTarget;
        otherHHS += hhsReal;
        otherHHSTarget += hhsTarget;
        otherInvoices += invCount;
      }
      totalItems += itemCount;
    });

    const salesPercent = targetSales > 0 ? Math.round((actualSales / targetSales) * 100) : 0;
    const hhsPercent = targetHHS > 0 ? Math.round((actualHHS / targetHHS) * 100) : 0;
    const hasManagedShops = dashboardShops.length > 0;
    const hhsRatioPct = hasManagedShops && actualSales > 0
      ? this.calculateHhsRatioPct(actualHHS, actualSales)
      : null;

    const daNangSalesPct = actualSales > 0 ? Math.round((daNangSales / actualSales) * 1000) / 10 : 0;
    const hueSalesPct = actualSales > 0 ? Math.round((hueSales / actualSales) * 1000) / 10 : 0.0;
    const otherSalesPct = actualSales > 0 ? Math.round((otherSales / actualSales) * 1000) / 10 : 0;

    const daNangHHSPct = actualHHS > 0 ? Math.round((daNangHHS / actualHHS) * 1000) / 10 : 0;
    const hueHHSPct = actualHHS > 0 ? Math.round((hueHHS / actualHHS) * 1000) / 10 : 0.0;
    const otherHHSPct = actualHHS > 0 ? Math.round((otherHHS / actualHHS) * 1000) / 10 : 0;

    const tbnPerShop = Number((actualSales / Math.max(dashboardShops.length, 1) / 30 / 1000000).toFixed(1));
    const avgInvoiceValue = totalInvoices > 0 ? Math.round(actualSales / totalInvoices) : 0;

    return {
      actualSales,
      targetSales,
      projectedSales: actualSales,
      salesPercent,
      daNangSales,
      daNangSalesPct,
      daNangTarget,
      hueSales,
      hueSalesPct,
      hueTarget,
      otherSales,
      otherSalesPct,
      otherTarget,
      actualHHS,
      targetHHS,
      projectedHHS: actualHHS,
      hhsPercent,
      hhsRatioPct,
      daNangHHS,
      daNangHHSPct,
      daNangHHSTarget,
      hueHHS,
      hueHHSPct,
      hueHHSTarget,
      otherHHS,
      otherHHSPct,
      otherHHSTarget,
      tbnPerShop,
      totalInvoices,
      avgInvoiceValue,
      itemsPerInvoice: totalInvoices > 0 ? Number((totalItems / totalInvoices).toFixed(1)) : 0,
      daNangProjectedSales: daNangSales,
      daNangProjectedHHS: daNangHHS,
      daNangHHSRatioPct: this.calculateHhsRatioPct(daNangHHS, daNangSales),
      daNangInvoices,
      otherInvoices,
      hueProjectedSales: hueSales,
      hueProjectedHHS: hueHHS,
      hueHHSRatioPct: this.calculateHhsRatioPct(hueHHS, hueSales),
      hueInvoices,
      shopsWithPlanData,
      shopList
    };
  }

}
