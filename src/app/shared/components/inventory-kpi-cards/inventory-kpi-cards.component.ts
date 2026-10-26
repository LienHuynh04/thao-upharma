import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from "@angular/core";
import { environment } from "../../../../environments/environment";
import { isWarehouseStore, normalizeInventoryRow } from "../../../inventory-utils";
import { UpharmaService } from "../../../upharma.service";

export type ExpiryBucketId = "all" | "expired" | "danger" | "warning" | "safe" | "normal";

export interface KpiCardItem {
  id: ExpiryBucketId;
  title: string;
  count: number;
  value: number;
  valueText: string;
  percentText: string;
  indicatorClass?: string;
  colorClass?: string;
}

export interface KpiSummaryMap {
  all: KpiCardItem;
  expired: KpiCardItem;
  danger: KpiCardItem;
  warning: KpiCardItem;
  safe: KpiCardItem;
  normal: KpiCardItem;
  updatedAt?: number;
}

@Component({
  selector: "app-inventory-kpi-cards",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-cards-grid" role="region" aria-label="6 Thẻ thống kê KPI Tồn kho theo hạn dùng">
      @for (card of cardsList; track card.id) {
        <div
          class="kpi-card"
          [class.has-indicator]="card.id !== 'all'"
          [ngClass]="card.indicatorClass || ''"
          [class.active]="selectedId === card.id"
          (click)="selectCard(card.id)"
          tabindex="0"
          role="button"
          [attr.aria-pressed]="selectedId === card.id"
          (keydown.enter)="selectCard(card.id)"
          (keydown.space)="selectCard(card.id)"
        >
          <div class="kpi-card-title">{{ card.title }}</div>
          <div class="kpi-card-count">
            {{ card.count }}
          </div>
          <div class="kpi-card-value" [title]="card.valueText">
            {{ card.valueText }}
          </div>
          <div class="kpi-card-percent">
            {{ card.percentText }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-cards-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-bottom: 16px;
      width: 100%;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e6e8eb;
      border-radius: 8px;
      padding: 12px 14px;
      position: relative;
      cursor: pointer;
      user-select: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 106px;
    }

    .kpi-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .kpi-card:focus-visible {
      outline: 2px solid #f59f00;
      outline-offset: 2px;
    }

    /* Mép viền màu chỉ thị hạn dùng */
    .kpi-card.has-indicator {
      border-left-width: 4px;
    }
    .kpi-card.indicator-red { border-left-color: #dc3545; }
    .kpi-card.indicator-red-orange { border-left-color: #e03131; }
    .kpi-card.indicator-orange { border-left-color: #fd7e14; }
    .kpi-card.indicator-green { border-left-color: #2fb344; }
    .kpi-card.indicator-blue { border-left-color: #206bc4; }

    /* Trạng thái Active */
    .kpi-card.active {
      border-color: #f59f00 !important;
      background-color: #fffbf0 !important;
      box-shadow: 0 0 0 1px #f59f00;
    }

    .kpi-card.active.has-indicator.indicator-red { border-left-color: #dc3545 !important; }
    .kpi-card.active.has-indicator.indicator-red-orange { border-left-color: #e03131 !important; }
    .kpi-card.active.has-indicator.indicator-orange { border-left-color: #fd7e14 !important; }
    .kpi-card.active.has-indicator.indicator-green { border-left-color: #2fb344 !important; }
    .kpi-card.active.has-indicator.indicator-blue { border-left-color: #206bc4 !important; }

    .kpi-card.active::before {
      content: "✓";
      position: absolute;
      top: 8px;
      right: 10px;
      color: #f59f00;
      font-size: 13px;
      font-weight: 700;
      line-height: 1;
    }

    /* Typography */
    .kpi-card-title {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .kpi-card-count {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.1;
    }
    .kpi-card-count.text-red { color: #dc3545; }
    .kpi-card-count.text-red-orange { color: #e03131; }
    .kpi-card-count.text-orange { color: #fd7e14; }
    .kpi-card-count.text-green { color: #2fb344; }
    .kpi-card-count.text-blue { color: #206bc4; }

    .kpi-card-value {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kpi-card-percent {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }

    /* Responsive */
    @media (max-width: 991.98px) {
      .kpi-cards-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 575.98px) {
      .kpi-cards-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .kpi-card {
        padding: 8px 10px;
        min-height: 92px;
      }
      .kpi-card-count {
        font-size: 20px;
      }
      .kpi-card-title {
        font-size: 11.5px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryKpiCardsComponent implements OnInit, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly upharma = inject(UpharmaService);

  /** Mã nhà thuốc cần thống kê (VD: SHOP0010, SHOP0018, SHOP0025,...) */
  @Input({ required: true }) shopCode = "";

  /** Tùy chọn truyền thẳng dữ liệu mảng thô từ bên ngoài (nếu có) */
  @Input() rawData: any[] | null = null;

  /** ID thẻ đang chọn */
  @Input() selectedId: ExpiryBucketId = "all";

  /** Event phát ra khi người dùng click chọn 1 thẻ */
  @Output() cardSelected = new EventEmitter<ExpiryBucketId>();

  /** Event phát ra khi dữ liệu tính toán hoàn tất (gửi kèm toàn bộ summary) */
  @Output() summaryCalculated = new EventEmitter<KpiSummaryMap>();

  summary: KpiSummaryMap = this.createDefaultSummary();

  get cardsList(): KpiCardItem[] {
    return [
      this.summary.all,
      this.summary.expired,
      this.summary.danger,
      this.summary.warning,
      this.summary.safe,
      this.summary.normal,
    ];
  }

  ngOnInit(): void {
    if (this.shopCode) {
      this.processShop(this.shopCode);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["shopCode"]) {
      const code = changes["shopCode"].currentValue;
      if (code) {
        this.processShop(code);
      }
    }

    if (changes["rawData"] && changes["rawData"].currentValue) {
      this.processRawData(changes["rawData"].currentValue);
    }
  }

  selectCard(id: ExpiryBucketId): void {
    this.selectedId = id;
    this.cardSelected.emit(id);
    this.cdr.markForCheck();
  }

  /**
   * Tải và tính toán theo chiến lược:
   * 1. Đọc Cache LocalStorage ngay lập tức (~0ms).
   * 2. Gọi API/Firebase ngầm ở background, tính toán Single-Pass O(N).
   * 3. Giải phóng mảng thô ngay lập tức, cập nhật UI và lưu cache.
   */
  async processShop(shopCode: string): Promise<void> {
    if (!shopCode) return;

    // BƯỚC 1: Đọc Cache LocalStorage hiển thị ngay trong 0ms
    const cacheKey = `upharma_kpi_cache_${shopCode}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as KpiSummaryMap;
        if (parsed && parsed.all) {
          this.summary = parsed;
          this.cdr.markForCheck();
          this.summaryCalculated.emit(this.summary);
        }
      }
    } catch (e) {
      console.warn("[KPI Cards] Lỗi đọc cache:", e);
    }

    // Nếu đã có rawData truyền trực tiếp từ cha thì dùng luôn
    if (this.rawData && this.rawData.length > 0) {
      this.processRawData(this.rawData);
      return;
    }

    // BƯỚC 2: Tải ngầm ở background
    await this.fetchAndCalculateBackground(shopCode, cacheKey);
  }

  private async fetchAndCalculateBackground(shopCode: string, cacheKey: string): Promise<void> {
    let rows: any[] = [];
    const firebaseDbUrl = (environment as any).firebaseDbUrl as string | undefined;
    const normalizedFirebase = firebaseDbUrl ? firebaseDbUrl.replace(/\/$/, "") : "";

    // 1. Thử đọc từ Firebase RTDB
    if (normalizedFirebase) {
      try {
        const res = await fetch(`${normalizedFirebase}/shops/${shopCode}/upharma_data/inventory.json`);
        if (res.ok) {
          const json = await res.json();
          if (json) {
            if (Array.isArray(json)) rows = json;
            else if (Array.isArray(json.data)) rows = json.data;
            else if (json.data && typeof json.data === "object") rows = Object.values(json.data);
          }
        }
      } catch (err) {
        console.warn(`[KPI Cards] Firebase fetch error cho ${shopCode}:`, err);
      }
    }

    // 2. Fallback gọi qua UpharmaService
    if (rows.length === 0) {
      try {
        const res = await this.upharma.loadInventoryResource({
          shopCodes: [shopCode],
          forceRefresh: false,
        });
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          rows = res.data;
        }
      } catch (svcErr) {
        console.warn(`[KPI Cards] loadInventoryResource error cho ${shopCode}:`, svcErr);
      }
    }

    // 3. Fallback gọi API UPharma trực tiếp nếu Firebase chưa có
    if (rows.length === 0) {
      try {
        const session = this.upharma.getSession();
        if (session) {
          const apiBase = (environment as any).directApiBaseUrl || (environment as any).apiBaseUrl;
          const url = `${apiBase.replace(/\/$/, "")}/LocalStore/GetInventoryShop`;
          const apiRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uPharmaID: session.UserInfo.uPharmaID,
              Token: session.Token,
              ShopCode: shopCode,
              BranchLst: "",
              ProductID: "",
              LotCode: "",
              PackageID: null,
              StoreType: "",
            }),
          });

          if (apiRes.ok) {
            const json = await apiRes.json();
            const keys = ["InventoryLst", "data", "Data", "items", "Items", "result"];
            for (const k of keys) {
              if (Array.isArray(json?.[k])) {
                rows = json[k];
                break;
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn(`[KPI Cards] API fetch error cho ${shopCode}:`, apiErr);
      }
    }

    // BƯỚC 3 & 4: Tính Single-pass O(N) và giải phóng bộ nhớ
    if (rows && rows.length > 0) {
      this.processRawData(rows, cacheKey);
    }
  }

  /**
   * Thuật toán Duyệt Đúng 1 Vòng Lặp O(N) (Single-pass):
   * Lọc loại trừ, phân loại hạn dùng, đếm độc bản và cộng dồn tiền
   */
  processRawData(rawList: any[], cacheKey?: string): void {
    if (!rawList || !Array.isArray(rawList)) return;

    const sets = {
      all: new Set<string>(),
      expired: new Set<string>(),
      danger: new Set<string>(),
      warning: new Set<string>(),
      safe: new Set<string>(),
      normal: new Set<string>(),
    };

    const values = {
      all: 0,
      expired: 0,
      danger: 0,
      warning: 0,
      safe: 0,
      normal: 0,
    };

    // ── DUYỆT 1 VÒNG LẶP DUY NHẤT O(N) ──
    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item) continue;

      // 1. Lọc loại trừ kho tổng / kho phụ
      if (isWarehouseStore(item)) continue;

      // Chuẩn hoá 1 lần bằng inventory-utils — nơi duy nhất map đúng field
      // thật của API: UnitPrice và ExpirationDate. Map tay bằng Price/GiaBan/
      // ExpDate như trước sẽ cho giá = 0 và hạn rỗng (mọi SP thành "bình thường").
      const normalized = normalizeInventoryRow(item, i);

      // 2. Lọc Voucher
      const pCode = normalized.productCode.toUpperCase().trim();
      const pName = normalized.productName.toUpperCase().trim();
      if (!pCode || pCode.includes("VOUCHER") || pName.includes("VOUCHER") || pCode.startsWith("VC")) {
        continue;
      }

      // 3. Giá trị tồn & số ngày còn lại đến hạn
      const stockVal = normalized.stockValue;
      const diffDays = normalized.expiryDaysRemaining;

      // Cập nhật nhóm "Tất cả"
      sets.all.add(pCode);
      values.all += stockVal;

      // Phân vào 5 nhóm hạn dùng
      if (diffDays === null || diffDays > 360) {
        sets.normal.add(pCode);
        values.normal += stockVal;
      } else if (diffDays < 0) {
        sets.expired.add(pCode);
        values.expired += stockVal;
      } else if (diffDays <= 90) {
        sets.danger.add(pCode);
        values.danger += stockVal;
      } else if (diffDays <= 180) {
        sets.warning.add(pCode);
        values.warning += stockVal;
      } else {
        // 181 <= diffDays <= 360
        sets.safe.add(pCode);
        values.safe += stockVal;
      }
    }

    const totalV = values.all;
    const formatVnd = (num: number) =>
      new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num) + " VNĐ";
    const calcPct = (part: number, total: number) =>
      total > 0 ? ((part / total) * 100).toFixed(2).replace(".", ",") + "%" : "0,00%";

    const result: KpiSummaryMap = {
      all: {
        id: "all",
        title: "Tất cả",
        count: sets.all.size,
        value: values.all,
        valueText: formatVnd(values.all),
        percentText: "100,00%",
      },
      expired: {
        id: "expired",
        title: "Hết hạn",
        count: sets.expired.size,
        value: values.expired,
        valueText: formatVnd(values.expired),
        percentText: calcPct(values.expired, totalV),
        indicatorClass: "indicator-red",
        colorClass: sets.expired.size > 0 ? "text-red" : "",
      },
      danger: {
        id: "danger",
        title: "3 Tháng",
        count: sets.danger.size,
        value: values.danger,
        valueText: formatVnd(values.danger),
        percentText: calcPct(values.danger, totalV),
        indicatorClass: "indicator-red-orange",
        colorClass: sets.danger.size > 0 ? "text-red-orange" : "",
      },
      warning: {
        id: "warning",
        title: "6 Tháng",
        count: sets.warning.size,
        value: values.warning,
        valueText: formatVnd(values.warning),
        percentText: calcPct(values.warning, totalV),
        indicatorClass: "indicator-orange",
        colorClass: sets.warning.size > 0 ? "text-orange" : "",
      },
      safe: {
        id: "safe",
        title: "1 Năm",
        count: sets.safe.size,
        value: values.safe,
        valueText: formatVnd(values.safe),
        percentText: calcPct(values.safe, totalV),
        indicatorClass: "indicator-green",
        colorClass: sets.safe.size > 0 ? "text-green" : "",
      },
      normal: {
        id: "normal",
        title: "Hàng bình thường",
        count: sets.normal.size,
        value: values.normal,
        valueText: formatVnd(values.normal),
        percentText: calcPct(values.normal, totalV),
        indicatorClass: "indicator-blue",
        colorClass: sets.normal.size > 0 ? "text-blue" : "",
      },
      updatedAt: Date.now(),
    };

    // Giải phóng bộ nhớ: không lưu trữ mảng chi tiết
    rawList = [];

    this.summary = result;
    this.cdr.markForCheck();
    this.summaryCalculated.emit(this.summary);

    // Lưu cache LocalStorage
    const key = cacheKey || (this.shopCode ? `upharma_kpi_cache_${this.shopCode}` : "");
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(result));
      } catch (e) {
        // Tránh lỗi QuotaExceeded
      }
    }
  }

  private createDefaultSummary(): KpiSummaryMap {
    const defaultItem = (id: ExpiryBucketId, title: string, indicatorClass?: string): KpiCardItem => ({
      id,
      title,
      count: 0,
      value: 0,
      valueText: "0 VNĐ",
      percentText: "0,00%",
      indicatorClass,
    });

    return {
      all: { ...defaultItem("all", "Tất cả"), percentText: "100,00%" },
      expired: defaultItem("expired", "Hết hạn", "indicator-red"),
      danger: defaultItem("danger", "3 Tháng", "indicator-red-orange"),
      warning: defaultItem("warning", "6 Tháng", "indicator-orange"),
      safe: defaultItem("safe", "1 Năm", "indicator-green"),
      normal: defaultItem("normal", "Hàng bình thường", "indicator-blue"),
    };
  }
}
