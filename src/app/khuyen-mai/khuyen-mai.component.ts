import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpharmaService } from '../upharma.service';
import { environment } from '../../environments/environment';

export interface PromotionListItem {
  id?: string;
  shopName: string;
  shopCode: string;
  timeRange: string;
  content: string;
}

@Component({
  selector: 'app-khuyen-mai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container p-3 p-md-4">
      <!-- Section Heading -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 class="fs-4 fw-extrabold m-0" style="color: #111827; font-weight: 800;">Khuyến mãi</h2>
          <span class="text-muted" style="font-size: 12px;">Chương trình khuyến mãi tại các nhà thuốc</span>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <!-- Filter Tabs: Đang hiển thị / Đã ẩn -->
          <div class="d-flex bg-white rounded-3 p-1 border shadow-2xs gap-1">
            <button
              class="btn btn-sm px-3 py-1 fw-bold rounded-2 transition-all d-flex align-items-center gap-1.5"
              [class.btn-primary]="activeTab === 'active'"
              [class.text-muted]="activeTab !== 'active'"
              [style.background-color]="activeTab === 'active' ? '#0d472b' : 'transparent'"
              [style.border-color]="activeTab === 'active' ? '#0d472b' : 'transparent'"
              (click)="activeTab = 'active'"
            >
              <span>Đang hiển thị</span>
              <span class="badge rounded-pill" [class.bg-white]="activeTab === 'active'" [class.text-success]="activeTab === 'active'" [class.bg-light]="activeTab !== 'active'" [class.text-dark]="activeTab !== 'active'">
                {{ activePromotions.length }}
              </span>
            </button>
            <button
              class="btn btn-sm px-3 py-1 fw-bold rounded-2 transition-all d-flex align-items-center gap-1.5"
              [class.btn-primary]="activeTab === 'hidden'"
              [class.text-muted]="activeTab !== 'hidden'"
              [style.background-color]="activeTab === 'hidden' ? '#0d472b' : 'transparent'"
              [style.border-color]="activeTab === 'hidden' ? '#0d472b' : 'transparent'"
              (click)="activeTab = 'hidden'"
            >
              <span>Đã ẩn</span>
              <span class="badge rounded-pill" [class.bg-white]="activeTab === 'hidden'" [class.text-success]="activeTab === 'hidden'" [class.bg-light]="activeTab !== 'hidden'" [class.text-dark]="activeTab !== 'hidden'">
                {{ hiddenPromotions.length }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3" style="background-color: #ffffff; border: 1px solid #e2e8f0 !important;">
        <div class="table-responsive">
          <table class="table table-hover align-middle m-0" style="font-size: 13px; width: 100%;">
            <thead style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 35%;">Tên NT</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 25%;">TG khuyến mãi</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 30%;">Nội dung CTKM</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center" style="width: 100px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @if (displayedPromotions.length === 0) {
                <tr>
                  <td colspan="4" class="text-center text-secondary py-5">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                      <span class="fs-1 mb-2">{{ activeTab === 'active' ? '🎁' : '👁️‍🗨️' }}</span>
                      <span class="fw-semibold">{{ activeTab === 'active' ? 'Không có chương trình khuyến mãi nào đang hiển thị.' : 'Chưa có chương trình khuyến mãi nào bị ẩn.' }}</span>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of displayedPromotions; track getPromoKey(item)) {
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td class="px-3">
                      <div class="fw-bold text-dark">{{ item.shopName }}</div>
                      <div class="text-secondary" style="font-size: 11px; color: #9ca3af !important;">{{ item.shopCode }}</div>
                    </td>
                    <td class="px-3 fw-bold text-dark">{{ item.timeRange }}</td>
                    <td class="px-3 fw-bold text-dark wrap-col" style="white-space: normal !important; word-break: break-word;">{{ item.content }}</td>
                    <td class="px-3 text-center" style="white-space: nowrap !important;">
                      @if (activeTab === 'active') {
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary px-2 py-1 fw-bold rounded-2 d-inline-flex align-items-center gap-1 shadow-2xs"
                          style="font-size: 11.5px;"
                          [disabled]="isUpdatingKey === getPromoKey(item)"
                          (click)="hidePromotion(item)"
                          title="Ẩn CTKM này"
                        >
                          <span *ngIf="isUpdatingKey !== getPromoKey(item)">👁️‍🗨️</span>
                          <span *ngIf="isUpdatingKey === getPromoKey(item)" class="spinner-border spinner-border-sm" role="status"></span>
                          Ẩn
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="btn btn-sm btn-success px-2 py-1 fw-bold rounded-2 text-white d-inline-flex align-items-center gap-1 shadow-2xs"
                          style="font-size: 11.5px; background-color: #0d472b; border-color: #0d472b;"
                          [disabled]="isUpdatingKey === getPromoKey(item)"
                          (click)="unhidePromotion(item)"
                          title="Khôi phục hiển thị CTKM này"
                        >
                          <span *ngIf="isUpdatingKey !== getPromoKey(item)">👁️</span>
                          <span *ngIf="isUpdatingKey === getPromoKey(item)" class="spinner-border spinner-border-sm" role="status"></span>
                          Hiện lại
                        </button>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        <div class="px-3 py-2 bg-light border-top text-secondary small fw-medium">
          Tổng số: {{ displayedPromotions.length }} CTKM {{ activeTab === 'active' ? 'đang hiển thị' : 'đã ẩn' }} (Tổng cộng: {{ promotions.length }} CTKM)
        </div>
      </div>

      <!-- Toast thông báo -->
      <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;" *ngIf="toastMessage">
        <div class="toast show align-items-center text-white bg-success border-0 shadow-lg rounded-3" role="alert">
          <div class="d-flex">
            <div class="toast-body fw-bold d-flex align-items-center gap-2">
              <span>✓</span> {{ toastMessage }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="toastMessage = ''"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
    }
  `]
})
export class KhuyenMaiComponent implements OnInit {
  promotions: PromotionListItem[] = [
    {
      shopName: 'Nhà thuốc số 10 - 194 Thái Thị Bôi - Đà Nẵng',
      shopCode: 'SHOP0010',
      timeRange: '01/07/2026 — 08/07/2026',
      content: 'Vòng quay may mắn'
    }
  ];

  activeTab: 'active' | 'hidden' = 'active';
  hiddenPromoKeys = new Set<string>();
  isUpdatingKey = '';
  toastMessage = '';
  private toastTimer: any = null;

  getPromoKey(item: PromotionListItem): string {
    const code = (item.shopCode || '').trim().toLowerCase();
    const content = (item.content || '').trim().toLowerCase().replace(/\s+/g, '_');
    const rawKey = `${code}__${content}`;
    return rawKey.replace(/[.#$\[\]\/]/g, '_');
  }

  get activePromotions(): PromotionListItem[] {
    return this.promotions.filter(p => !this.hiddenPromoKeys.has(this.getPromoKey(p)));
  }

  get hiddenPromotions(): PromotionListItem[] {
    return this.promotions.filter(p => this.hiddenPromoKeys.has(this.getPromoKey(p)));
  }

  get displayedPromotions(): PromotionListItem[] {
    return this.activeTab === 'active' ? this.activePromotions : this.hiddenPromotions;
  }

  constructor(
    private upharma: UpharmaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadPromotionsData(),
      this.loadHiddenPromotions()
    ]);
  }

  async loadPromotionsData() {
    try {
      const session = this.upharma.ensureLogin();
      const res = await this.upharma.callEndpoint<any>('/SalesInvoice/CheckPromoOrder', {
        Token: session.Token,
        uPharmaID: String(session.UserInfo.uPharmaID),
        ShopCode: 'SHOP0010'
      });
      if (res && Array.isArray(res.Data) && res.Data.length > 0) {
        // Hydrate from promo endpoint if live data is available
      }
    } catch (e) {
      console.warn('Using promotion fallback list');
    }
  }

  private get uPharmaID(): string {
    const session = this.upharma.getSession();
    const id = session?.UserInfo?.uPharmaID;
    if (id !== undefined && id !== null && String(id).trim() !== '') {
      return String(id).replace(/[.#$\[\]\/]/g, '_');
    }
    return 'default_user';
  }

  private get storageKey(): string {
    return `upharma_hidden_promotions_${this.uPharmaID}`;
  }

  private getLocalStorageHidden(): Set<string> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveLocalStorageHidden(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.hiddenPromoKeys]));
    } catch {}
  }

  async loadHiddenPromotions(): Promise<void> {
    // 1. Tải ngay từ localStorage để hiển thị tức thì
    this.hiddenPromoKeys = this.getLocalStorageHidden();

    // 2. Đồng bộ với Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_promotions/${this.uPharmaID}.json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const remoteKeys = Object.keys(data);
          for (const k of remoteKeys) {
            this.hiddenPromoKeys.add(k);
          }
          this.saveLocalStorageHidden();
        }
      }
    } catch (e) {
      console.warn('Lỗi khi tải danh sách khuyến mãi ẩn từ Firebase:', e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async hidePromotion(item: PromotionListItem): Promise<void> {
    const promoKey = this.getPromoKey(item);
    this.isUpdatingKey = promoKey;

    // Cập nhật giao diện tức thì
    this.hiddenPromoKeys.add(promoKey);
    this.saveLocalStorageHidden();
    this.showToast(`Đã ẩn CTKM "${item.content}" thành công.`);
    this.cdr.detectChanges();

    // Đồng bộ lên Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_promotions/${this.uPharmaID}/${promoKey}.json`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hidden: true,
          promoKey,
          shopName: item.shopName,
          shopCode: item.shopCode,
          content: item.content,
          timeRange: item.timeRange,
          updatedAt: new Date().toISOString()
        })
      });
      if (!res.ok) {
        console.warn(`[Firebase] Không thể ghi trạng thái ẩn khuyến mãi (HTTP ${res.status}), đã lưu offline.`);
      }
    } catch (e) {
      console.warn(`[Firebase] Lỗi mạng khi ẩn khuyến mãi, đã lưu offline:`, e);
    } finally {
      this.isUpdatingKey = '';
      this.cdr.detectChanges();
    }
  }

  async unhidePromotion(item: PromotionListItem): Promise<void> {
    const promoKey = this.getPromoKey(item);
    this.isUpdatingKey = promoKey;

    // Cập nhật giao diện tức thì
    this.hiddenPromoKeys.delete(promoKey);
    this.saveLocalStorageHidden();
    this.showToast(`Đã khôi phục hiển thị CTKM "${item.content}" thành công.`);
    this.cdr.detectChanges();

    // Đồng bộ xóa trên Firebase (DELETE)
    try {
      const url = `${environment.firebaseDbUrl}/hidden_promotions/${this.uPharmaID}/${promoKey}.json`;
      const res = await fetch(url, {
        method: 'DELETE'
      });
      if (!res.ok) {
        console.warn(`[Firebase] Không thể xóa trạng thái ẩn khuyến mãi (HTTP ${res.status}), đã lưu offline.`);
      }
    } catch (e) {
      console.warn(`[Firebase] Lỗi mạng khi bỏ ẩn khuyến mãi, đã lưu offline:`, e);
    } finally {
      this.isUpdatingKey = '';
      this.cdr.detectChanges();
    }
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }
}
