import { CommonModule, DecimalPipe } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { environment } from "../../environments/environment";
import { RawRecord, ShopInfo, UpharmaService } from "../upharma.service";
import { isWarehouseStore } from "../inventory-utils";

export interface ShopOverviewItem {
  province: string;
  shopCode: string;
  shopName: string;
  totalStockValue: number;
  dateUnder3MValue: number;
  dateUnder3MRate: number;
  dateUnder6MValue: number;
  dateUnder6MRate: number;
  dateUnder12MValue: number;
  dateUnder12MRate: number;
}

export interface OverviewTotalSummary {
  shopsCount: number;
  totalStockValue: number;
  dateUnder3MValue: number;
  dateUnder3MRate: number;
  dateUnder6MValue: number;
  dateUnder6MRate: number;
  dateUnder12MValue: number;
  dateUnder12MRate: number;
}

@Component({
  selector: "app-inventory-summary",
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: "./inventory-summary.component.html",
  styleUrls: ["./inventory-summary.component.css"],
})
export class InventorySummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly upharma = inject(UpharmaService);

  // ── Dữ liệu ─────────────────────────────────────────────────────
  shopRows: ShopOverviewItem[] = [];
  rawShops: ShopInfo[] = [];

  // ── Bộ lọc ──────────────────────────────────────────────────────
  selectedPeriod = "";
  availablePeriods: { value: string; label: string; year: number; month: number }[] = [];
  selectedShopCode: string = "all";
  searchText = "";

  // ── Trạng thái ──────────────────────────────────────────────────
  isLoading = false;
  errorText = "";
  todayDisplay = "";

  // ── Getters ─────────────────────────────────────────────────────
  get shopCodesList(): string[] {
    const set = new Set<string>();
    for (const r of this.shopRows) {
      if (r.shopCode) set.add(r.shopCode);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }

  get filteredRows(): ShopOverviewItem[] {
    let list = this.shopRows;
    if (this.selectedShopCode !== "all") {
      list = list.filter((r) => r.shopCode.toLowerCase() === this.selectedShopCode.toLowerCase());
    }
    if (this.searchText && this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.shopCode.toLowerCase().includes(q) ||
          r.shopName.toLowerCase().includes(q),
      );
    }
    return list;
  }

  get totalSummary(): OverviewTotalSummary {
    const rows = this.filteredRows;
    const shopsCount = rows.length;
    const totalStockValue = rows.reduce((s, r) => s + (r.totalStockValue || 0), 0);
    const dateUnder3MValue = rows.reduce((s, r) => s + (r.dateUnder3MValue || 0), 0);
    const dateUnder3MRate = totalStockValue > 0 ? (dateUnder3MValue / totalStockValue) * 100 : 0;
    const dateUnder6MValue = rows.reduce((s, r) => s + (r.dateUnder6MValue || 0), 0);
    const dateUnder6MRate = totalStockValue > 0 ? (dateUnder6MValue / totalStockValue) * 100 : 0;
    const dateUnder12MValue = rows.reduce((s, r) => s + (r.dateUnder12MValue || 0), 0);
    const dateUnder12MRate = totalStockValue > 0 ? (dateUnder12MValue / totalStockValue) * 100 : 0;

    return {
      shopsCount,
      totalStockValue,
      dateUnder3MValue,
      dateUnder3MRate,
      dateUnder6MValue,
      dateUnder6MRate,
      dateUnder12MValue,
      dateUnder12MRate,
    };
  }

  ngOnInit(): void {
    this.setupPeriods();
    const today = new Date();
    this.todayDisplay = `${today.getDate()}/${today.getMonth() + 1}`;

    this.rawShops = this.upharma.getActiveShops() || [];

    // Tải dữ liệu: Đọc Cache LocalStorage ngay lập tức (~0ms)
    this.loadFromCache();

    // Tải dữ liệu từ Firebase / tính toán ngầm ở background
    void this.fetchOverviewData();
  }

  private setupPeriods(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const periods: { value: string; label: string; year: number; month: number }[] = [];
    for (let i = 0; i < 6; i++) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      const mStr = String(m).padStart(2, "0");
      periods.push({
        value: `${y}-${mStr}`,
        label: `${m}/${y}`,
        year: y,
        month: m,
      });
    }

    this.availablePeriods = periods;
    this.selectedPeriod = periods[0].value;
  }

  onPeriodChange(): void {
    this.loadFromCache();
    void this.fetchOverviewData();
  }

  setShopFilter(code: string): void {
    this.selectedShopCode = code;
    this.cdr.detectChanges();
  }

  setProvinceFilter(code: string): void {
    this.setShopFilter(code);
  }

  applyFilter(): void {
    this.cdr.detectChanges();
  }

  // ─── Cache-first (~0ms) ─────────────────────────────────────────
  private loadFromCache(): void {
    const cacheKey = `upharma_shops_overview_cache_${this.selectedPeriod}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.shopRows = parsed;
          this.cdr.detectChanges();
        }
      }
    } catch (e) {}
  }

  private saveToCache(rows: ShopOverviewItem[]): void {
    const cacheKey = `upharma_shops_overview_cache_${this.selectedPeriod}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(rows));
    } catch (e) {}
  }

  private parseInventoryResponse(json: any): ShopOverviewItem[] | null {
    if (!json) return null;
    if (Array.isArray(json?.items) && json.items.length > 0) {
      return json.items;
    }
    if (Array.isArray(json) && json.length > 0) {
      return json;
    }
    if (typeof json === "object" && !Array.isArray(json)) {
      const dataObj = json.data && typeof json.data === "object" && !Array.isArray(json.data) ? json.data : json;
      const keys = Object.keys(dataObj).filter(
        (k) => k.startsWith("SHOP") || (typeof dataObj[k] === "object" && dataObj[k] !== null),
      );
      if (keys.length > 0) {
        return keys.map((k) => {
          const item = dataObj[k];
          const total = Number(item.Total ?? item.totalStockValue ?? item.total ?? 0);
          const d3 = Number(item.Date_3th ?? item.dateUnder3MValue ?? 0);
          const d6 = Number(item.Date_6th ?? item.dateUnder6MValue ?? 0);
          const d12 = Number(item.Date_12th ?? item.dateUnder12MValue ?? 0);
          const r3 = Number(item.Date_3th_Rate ?? item.dateUnder3MRate ?? (total > 0 ? (d3 / total) * 100 : 0));
          const r6 = Number(item.Date_6th_Rate ?? item.dateUnder6MRate ?? (total > 0 ? (d6 / total) * 100 : 0));
          const r12 = Number(item.Date_12th_Rate ?? item.dateUnder12MRate ?? (total > 0 ? (d12 / total) * 100 : 0));
          const shopCode = item.ShopCode || item.shopCode || k;
          const shopName = item.ShopName || item.shopName || shopCode;
          const province = item.Province || item.province || this.extractProvince(shopName);

          return {
            shopCode,
            shopName,
            province,
            totalStockValue: total,
            dateUnder3MValue: d3,
            dateUnder3MRate: r3,
            dateUnder6MValue: d6,
            dateUnder6MRate: r6,
            dateUnder12MValue: d12,
            dateUnder12MRate: r12,
          };
        });
      }
    }
    return null;
  }

  // ─── Tải dữ liệu từ Firebase RTDB hoặc Tính toán ────────────────
  async fetchOverviewData(forceRefresh = false): Promise<void> {
    const firebaseDbUrl = (environment as any).firebaseDbUrl as string | undefined;
    const normalizedFirebase = firebaseDbUrl ? firebaseDbUrl.replace(/\/$/, "") : "";

    // 1. Thử tải từ Firebase RTDB (inventory.json, upharma_data/inventory.json, shops_inventory_overview.json)
    if (normalizedFirebase && !forceRefresh) {
      const endpoints = [
        `${normalizedFirebase}/inventory.json`,
        `${normalizedFirebase}/upharma_data/inventory.json`,
        `${normalizedFirebase}/shops_inventory_overview.json`,
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const json = await res.json();
            const items = this.parseInventoryResponse(json);
            if (items && items.length > 0) {
              this.shopRows = items;
              this.saveToCache(items);
              this.cdr.detectChanges();
              return;
            }
          }
        } catch (err) {
          console.warn(`[Overview] Lỗi tải từ ${ep}:`, err);
        }
      }
    }

    // 2. Thử tải từ file tĩnh assets/data/inventory.json
    try {
      const res = await fetch("assets/data/inventory.json");
      if (res.ok) {
        const json = await res.json();
        const items = this.parseInventoryResponse(json);
        if (items && items.length > 0) {
          this.shopRows = items;
          this.saveToCache(items);
          this.cdr.detectChanges();
          return;
        }
      }
    } catch {}

    // 3. Nếu Firebase chưa có bản tổng hợp sẵn, tiến hành tính toán trực tiếp
    await this.calculateAllShopsOverview();
  }

  // ─── Tính toán toàn bộ nhà thuốc ────────────────────────────────
  async calculateAllShopsOverview(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const shops = this.rawShops.length > 0 ? this.rawShops : this.upharma.getActiveShops() || [];
      if (shops.length === 0) return;

      const firebaseDbUrl = (environment as any).firebaseDbUrl as string | undefined;
      const normalizedFirebase = firebaseDbUrl ? firebaseDbUrl.replace(/\/$/, "") : "";

      const results: ShopOverviewItem[] = [];

      for (const shop of shops) {
        let inventoryRows: RawRecord[] = [];

        // A. Tải tồn kho từ Firebase
        if (normalizedFirebase) {
          try {
            const res = await fetch(`${normalizedFirebase}/shops/${shop.ShopCode}/upharma_data/inventory.json`);
            if (res.ok) {
              const json = await res.json();
              if (json && (json.Date_3th !== undefined || json.Total !== undefined || json.totalStockValue !== undefined)) {
                const total = Number(json.Total ?? json.totalStockValue ?? 0);
                const d3 = Number(json.Date_3th ?? json.dateUnder3MValue ?? 0);
                const d6 = Number(json.Date_6th ?? json.dateUnder6MValue ?? 0);
                const d12 = Number(json.Date_12th ?? json.dateUnder12MValue ?? 0);
                results.push({
                  shopCode: json.ShopCode || json.shopCode || shop.ShopCode,
                  shopName: json.ShopName || json.shopName || shop.ShopName,
                  province: json.Province || json.province || this.extractProvince(shop.ShopName),
                  totalStockValue: total,
                  dateUnder3MValue: d3,
                  dateUnder3MRate: Number(json.Date_3th_Rate ?? json.dateUnder3MRate ?? (total > 0 ? (d3 / total) * 100 : 0)),
                  dateUnder6MValue: d6,
                  dateUnder6MRate: Number(json.Date_6th_Rate ?? json.dateUnder6MRate ?? (total > 0 ? (d6 / total) * 100 : 0)),
                  dateUnder12MValue: d12,
                  dateUnder12MRate: Number(json.Date_12th_Rate ?? json.dateUnder12MRate ?? (total > 0 ? (d12 / total) * 100 : 0)),
                });
                continue;
              }
              if (Array.isArray(json)) inventoryRows = json;
              else if (Array.isArray(json?.data)) inventoryRows = json.data;
              else if (json?.data && typeof json.data === "object") inventoryRows = Object.values(json.data);
            }
          } catch {}
        }

        // B. Fallback trực tiếp qua UpharmaService
        if (inventoryRows.length === 0) {
          try {
            const res = await this.upharma.loadInventoryResource({
              shopCodes: [shop.ShopCode],
              forceRefresh: false,
            });
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
              inventoryRows = res.data;
            }
          } catch {}
        }

        // C. Phân loại hạn dùng & Tính giá trị
        let totalStockValue = 0;
        let dateUnder3MValue = 0;
        let dateUnder6MValue = 0;
        let dateUnder12MValue = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        for (let i = 0; i < inventoryRows.length; i++) {
          const item = inventoryRows[i];
          if (!item) continue;
          if (isWarehouseStore(item)) continue;

          const pCode = String(item["ProductCode"] || item["ProductID"] || item["MaSP"] || "").toUpperCase().trim();
          const pName = String(item["ProductName"] || item["Product_Name"] || item["TenSP"] || "").toUpperCase().trim();
          if (pCode.includes("VOUCHER") || pName.includes("VOUCHER") || pCode.startsWith("VC")) continue;

          const qty = Number(item["Quantity"] ?? item["Qty"] ?? item["TonKho"] ?? item["SL"] ?? 0) || 0;
          const price = Number(item["Price"] ?? item["GiaBan"] ?? item["RetailPrice"] ?? 0) || 0;
          const stockVal = price * qty;

          totalStockValue += stockVal;

          // HSD
          const expRaw = item["ExpDate"] ?? item["ExpireDate"] ?? item["HanDung"] ?? item["HSD"] ?? "";
          if (expRaw) {
            let expDate: Date | null = null;
            if (expRaw instanceof Date) expDate = expRaw;
            else {
              const text = String(expRaw).trim();
              const aspNet = text.match(/\/Date\((\d+)\)\//);
              if (aspNet) expDate = new Date(Number(aspNet[1]));
              else {
                const ddmmyyyy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
                if (ddmmyyyy) expDate = new Date(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1]));
                else {
                  const parsed = new Date(text.replace(" ", "T"));
                  if (!Number.isNaN(parsed.getTime())) expDate = parsed;
                }
              }
            }

            if (expDate) {
              expDate.setHours(0, 0, 0, 0);
              const diffDays = Math.floor((expDate.getTime() - todayMs) / 86400000);
              if (diffDays <= 90) {
                dateUnder3MValue += stockVal;
              }
              if (diffDays <= 180) {
                dateUnder6MValue += stockVal;
              }
              if (diffDays <= 360) {
                dateUnder12MValue += stockVal;
              }
            }
          }
        }

        const dateUnder3MRate = totalStockValue > 0 ? (dateUnder3MValue / totalStockValue) * 100 : 0;
        const dateUnder6MRate = totalStockValue > 0 ? (dateUnder6MValue / totalStockValue) * 100 : 0;
        const dateUnder12MRate = totalStockValue > 0 ? (dateUnder12MValue / totalStockValue) * 100 : 0;

        results.push({
          province: this.extractProvince(shop.ShopName),
          shopCode: shop.ShopCode,
          shopName: shop.ShopName || shop.ShopCode,
          totalStockValue,
          dateUnder3MValue,
          dateUnder3MRate: Number(dateUnder3MRate.toFixed(2)),
          dateUnder6MValue,
          dateUnder6MRate: Number(dateUnder6MRate.toFixed(2)),
          dateUnder12MValue,
          dateUnder12MRate: Number(dateUnder12MRate.toFixed(2)),
        });
      }

      this.shopRows = results;
      this.saveToCache(results);
      this.cdr.detectChanges();
    } catch (err) {
      console.error("[Overview] Lỗi tính toán tổng quan:", err);
      this.errorText = `Lỗi tải dữ liệu: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────
  formatMoneyNum(num: number | undefined | null): string {
    if (!num) return "0";
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num);
  }

  extractProvince(shopName: string): string {
    const s = String(shopName || "").toLowerCase();
    if (s.includes("khánh hòa") || s.includes("khanh hoa") || s.includes("nha trang") || s.includes("cam ranh")) return "Khánh Hòa";
    if (s.includes("gia lai") || s.includes("pleiku")) return "Gia Lai";
    if (s.includes("đắk lắk") || s.includes("dak lak") || s.includes("buôn ma thuột") || s.includes("bmt")) return "Đắk Lắk";
    if (s.includes("đà nẵng") || s.includes("da nang") || s.includes("liên chiểu") || s.includes("hải châu") || s.includes("ngũ hành sơn") || s.includes("thanh khê") || s.includes("sơn trà")) return "Đà Nẵng";
    if (s.includes("quảng nam") || s.includes("hội an") || s.includes("tam kỳ")) return "Quảng Nam";
    if (s.includes("huế") || s.includes("thừa thiên")) return "Thừa Thiên Huế";
    if (s.includes("hà nội") || s.includes("ha noi")) return "Hà Nội";
    if (s.includes("hồ chí minh") || s.includes("hcm") || s.includes("sài gòn")) return "Hồ Chí Minh";
    const parts = String(shopName || "").split("-");
    if (parts.length > 1) {
      const last = parts[parts.length - 1].trim();
      if (last.length > 2) return last;
    }
    return "Miền Trung";
  }
}
