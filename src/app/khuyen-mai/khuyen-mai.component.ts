import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpharmaService } from '../upharma.service';

export interface PromotionListItem {
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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fs-4 fw-extrabold m-0" style="color: #111827; font-weight: 800;">Khuyến mãi</h2>
        <div>
          <button class="btn btn-success btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1" style="background-color: #0d472b; border-color: #0d472b;">
            <span>+</span> Thêm khuyến mãi
          </button>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3" style="background-color: #ffffff; border: 1px solid #e2e8f0 !important;">
        <div class="table-responsive">
          <table class="table table-hover align-middle m-0" style="font-size: 13px;">
            <thead style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 35%;">Tên NT</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 30%;">TG khuyến mãi</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 25%;">Nội dung CTKM</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center" style="width: 10%;"></th>
              </tr>
            </thead>
            <tbody>
              @for (item of promotions; track item.shopCode) {
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td class="px-3">
                    <div class="fw-bold text-dark">{{ item.shopName }}</div>
                    <div class="text-secondary" style="font-size: 11px; color: #9ca3af !important;">{{ item.shopCode }}</div>
                  </td>
                  <td class="px-3 fw-bold text-dark">{{ item.timeRange }}</td>
                  <td class="px-3 fw-bold text-dark wrap-col" style="white-space: normal !important; word-break: break-word;">{{ item.content }}</td>
                  <td class="px-3 text-center">
                    <div class="d-flex justify-content-center gap-2" style="font-size: 12px; font-weight: 700;">
                      <a href="javascript:void(0)" class="text-decoration-none" style="color: #059669;">Sửa</a>
                      <a href="javascript:void(0)" class="text-decoration-none" style="color: #ef4444;">Xoá</a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-3 py-2 bg-light border-top text-secondary small fw-medium">
          Tổng số: {{ promotions.length }} bản ghi
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

  constructor(private upharma: UpharmaService) {}

  async ngOnInit() {
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
}
