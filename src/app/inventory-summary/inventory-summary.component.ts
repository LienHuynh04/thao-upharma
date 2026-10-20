import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorySummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly upharma = inject(UpharmaService);

  // ── Thời gian ────────────────────────────────────────────
  readonly months = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i);
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  // ── Loading ───────────────────────────────────────────────
  isInventoryLoading = false;
  isHhsLoading = false;
  isSyncing = false;
  syncStatus = "";
  loadingTitle = "";
  loadingProgressPercent = 0;
  errorText = "";
  successText = "";
  syncLogs: SyncLog[] = [];

  // ── Shop state ────────────────────────────────────────────
  activeShopCode = "";
  activeExpiryFilter: ExpiryStatus | "all" = "all";

  shopSummaries: ShopInventorySummary[] = [];
  hhsSummaries: ShopHhsSummary[] = [];

  // ── Ngày ─────────────────────────────────────────────────
  daysElapsed = 0;
  totalDaysInMonth = 0;

  // ── Getters ───────────────────────────────────────────────
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

  trackByShop(_: number, shop: ShopInventorySummary): string {
    return shop.shopCode;
  }

  // ─────────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.computeDays();
    this.reload();
  }

  onPeriodChange(): void {
    this.computeDays();
    this.loadHhs();
  }

  setExpiryFilter(key: ExpiryStatus | "all"): void {
    this.activeExpiryFilter = key;
    this.cdr.markForCheck();
  }

  setActiveShop(shopCode: string): void {
    this.activeShopCode = shopCode;
    this.cdr.markForCheck();
  }

  async reload(): Promise<void> {
    this.errorText = "";
    this.successText = "";
    await Promise.all([this.loadInventoryFromFirebase(), this.loadHhs()]);
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
  // BƯỚC 1: ĐỌC TỒN KHO TỪ FIREBASE (cache sẵn)
  // ─────────────────────────────────────────────────────────

  private async loadInventoryFromFirebase(): Promise<void> {
    this.isInventoryLoading = true;
    this.loadingTitle = "Đang tải tồn kho từ Firebase...";
    this.loadingProgressPercent = 10;
    this.cdr.markForCheck();

    try {
      const shops = this.upharma.getActiveShops();
      const response = await this.upharma.loadInventoryResource({ forceRefresh: false });
      this.loadingProgressPercent = 80;

      this.buildShopSummaries(shops, response.data);

      if (shops.length > 0 && !this.activeShopCode) {
        this.activeShopCode = shops[0].ShopCode;
      }

      this.loadingProgressPercent = 100;
    } catch (err) {
      this.errorText = `Lỗi tải tồn kho: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      this.isInventoryLoading = false;
      this.loadingTitle = "";
      this.loadingProgressPercent = 0;
      this.cdr.markForCheck();
    }
  }

  // ─────────────────────────────────────────────────────────
  // BƯỚC 2: GỌI API → ĐẨYLÊN FIREBASE (nút "Đồng bộ")
  // ─────────────────────────────────────────────────────────

  async syncToFirebase(): Promise<void> {
    this.isSyncing = true;
    this.syncStatus = "Đang xử lý...";
    this.errorText = "";
    this.successText = "";
    this.syncLogs = [];
    this.cdr.markForCheck();

    try {
      const session = this.upharma.ensureLogin();
      const shops = this.upharma.getActiveShops();
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
        this.cdr.markForCheck();

        try {
          // ── Gọi API lấy tồn kho ──────────────────────────
          this.addLog(`[${shop.ShopCode}] Gọi API GetInventoryShop...`, "info");
          const response = await this.callInventoryApi(session, shop.ShopCode);
          const rawItems: RawRecord[] = this.extractArray(response).map((item) => ({
            ...item,
            __shopCode: shop.ShopCode,
            __shopName: shop.ShopName,
            ShopCode: shop.ShopCode,
            ShopName: shop.ShopName,
          }));

          // ── Lọc kho tổng & voucher ────────────────────────
          const filtered = rawItems.filter((item) => {
            if (isWarehouseStore(item)) return false;
            const nameStr = String(item["ProductName"] || item["Product_Name"] || item["TenSP"] || "").toLowerCase();
            const codeStr = String(item["ProductCode"] || item["ProductID"] || item["MaSP"] || "").toLowerCase();
            return !nameStr.includes("voucher") && !codeStr.includes("voucher");
          });

          this.addLog(`[${shop.ShopCode}] Lấy được ${filtered.length} dòng (gốc: ${rawItems.length})`, "info");

          // ── Đẩy lên Firebase ─────────────────────────────
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

      // ── Cập nhật UI từ dữ liệu vừa lấy ──────────────────
      if (allInventoryData.length > 0) {
        this.buildShopSummaries(shops, allInventoryData);
        if (!this.activeShopCode && shops.length > 0) {
          this.activeShopCode = shops[0].ShopCode;
        }
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
      this.cdr.markForCheck();

      // Tự xóa thông báo thành công sau 5 giây
      if (this.successText) {
        setTimeout(() => {
          this.successText = "";
          this.cdr.markForCheck();
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

  // ─── Extract array từ response ──────────────────────────

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
    this.cdr.markForCheck();

    try {
      const shops = this.upharma.getActiveShops();
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

        if (amount === 0 && amountR === 0) continue;

        summaries.push({
          shopCode: shop.ShopCode,
          shopName: shop.ShopName,
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
      this.cdr.markForCheck();
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
      .filter((e) => e.products.size > 0 || e.totalValue > 0)
      .map((e) => {
        const tv = e.totalValue || 1;
        const pct = (v: number) => ((v / tv) * 100).toFixed(2).replace(".", ",");
        return {
          shopCode: e.info.ShopCode,
          shopName: e.info.ShopName,
          totalProducts: e.products.size,
          totalValue: e.totalValue,
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
      });
  }

  // ─── Log helper ─────────────────────────────────────────

  private addLog(message: string, type: SyncLog["type"]): void {
    this.syncLogs.push({ message, type });
    this.cdr.markForCheck();
  }
}
