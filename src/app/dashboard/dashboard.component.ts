import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UpharmaService } from '../upharma.service';
import { DashboardService, DashboardShopItem, DashboardOverviewResult, ShopStaffInfo } from './dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div *ngIf="isLoading" class="dashboard-loading" role="status">
      <div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="fw-bold text-dark fs-5">Đang tải dữ liệu tổng quan...</div>
    </div>
    <div *ngIf="dashboardErrorText" class="dashboard-error" role="alert">
      <strong>Không thể tải đủ dữ liệu tổng quan.</strong>
      <span>{{ dashboardErrorText }}</span>
      <button type="button" class="btn btn-sm btn-outline-success" (click)="loadDashboardData()">Thử tải lại</button>
      <a routerLink="/login" class="btn btn-sm btn-danger text-white">Đăng nhập lại</a>
    </div>

    <div class="content" id="content" [class.dashboard-loading-hidden]="isLoading || !!dashboardErrorText">

      <!-- Top Brand Header (Ảnh 1 & 2) -->
      <div class="top-nav-bar">
        <div class="top-title-group">
          <div class="title-accent-bar"></div>
          <h1 class="main-page-title">Tổng Quan</h1>
        </div>

        <div class="center-controls">
          <!-- View switcher tabs -->
          <div class="view-tabs">
            <button type="button" [class.active]="activeTab === 'target'" (click)="activeTab = 'target'">
              📊 Chỉ tiêu & Doanh số
            </button>
            <button type="button" [class.active]="activeTab === 'staff'" (click)="activeTab = 'staff'">
              👥 Nhân sự khu vực
            </button>
            <button type="button" [class.active]="activeTab === 'kpi'" (click)="activeTab = 'kpi'">
              📈 Thống kê & Biểu đồ
            </button>
            <button type="button" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
              📋 Xem tất cả
            </button>
          </div>

          <button
            type="button"
            class="btn-refresh-data"
            (click)="loadDashboardData(true)"
            [disabled]="isLoading"
            title="Tải lại số liệu mới nhất"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" [class.spin]="isLoading">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>

        <!-- User account pill badge from Image 1 & 2 -->
        <div class="user-pill-badge">
          <div class="user-pill-avatar">0</div>
          <div class="user-pill-details">
            <span class="user-pill-email">{{ userAccountEmail }}</span>
            <span class="user-pill-role">{{ userAccountRole }}</span>
          </div>
        </div>
      </div>

      <!-- ======= VIEW: TIẾN ĐỘ CHỈ TIÊU (ẢNH 1 TRÊN) ======= -->
      <section *ngIf="activeTab === 'target' || activeTab === 'all'" class="mb-4">
        <div class="section-card">
          <div class="bar-overview-list">
            @for (s of getSortedShopsByPerformance(); track s.code) {
              <div class="bar-shop-row">
                <!-- Shop code & name -->
                <div class="bar-shop-col">
                  <div class="bar-shop-code-text">{{ s.code }}</div>
                  <div class="bar-shop-name-text">{{ s.code }}</div>
                </div>

                <!-- Doanh Số horizontal bar with actual & projected -->
                <div class="bar-metric-col">
                  <div class="progress-track-wrapper">
                    <div class="progress-track">
                      <!-- Actual (đậm) -->
                      <div class="track-fill-actual"
                           [style.width.%]="Math.min(s.pctDS, 100)"
                           [style.background-color]="getBarColor(s.pctDK)">
                      </div>
                      <!-- Projected (nhạt) -->
                      <div class="track-fill-projected"
                           *ngIf="s.pctDK > s.pctDS"
                           [style.left.%]="Math.min(s.pctDS, 100)"
                           [style.width.%]="Math.min(s.pctDK - s.pctDS, 100 - Math.min(s.pctDS, 100))"
                           [style.background-color]="getBarBgColor(s.pctDK)">
                      </div>
                      <!-- KPI threshold line at 85% -->
                      <div class="kpi-threshold-line line-85" title="Ngưỡng KPI 85%"></div>
                      <!-- Target line at 100% -->
                      <div class="kpi-threshold-line line-100" title="Chỉ tiêu 100%"></div>
                    </div>
                  </div>
                  <!-- Percentage label with status square -->
                  <div class="metric-pct-wrap">
                    <span class="status-indicator-box" [style.background-color]="getBarColor(s.pctDK)"></span>
                    <span class="metric-pct-text"><b>{{ s.pctDS }}%</b> → {{ s.pctDK }}%</span>
                  </div>
                </div>

                <!-- Hàng Hệ Số horizontal bar with actual & projected -->
                <div class="bar-metric-col">
                  <div class="progress-track-wrapper">
                    <div class="progress-track">
                      <!-- Actual (đậm) -->
                      <div class="track-fill-actual"
                           [style.width.%]="Math.min(getShopHhsPct(s), 100)"
                           [style.background-color]="getBarColor(getShopHhsProjectedPct(s))">
                      </div>
                      <!-- Projected (nhạt) -->
                      <div class="track-fill-projected"
                           *ngIf="getShopHhsProjectedPct(s) > getShopHhsPct(s)"
                           [style.left.%]="Math.min(getShopHhsPct(s), 100)"
                           [style.width.%]="Math.min(getShopHhsProjectedPct(s) - getShopHhsPct(s), 100 - Math.min(getShopHhsPct(s), 100))"
                           [style.background-color]="getBarBgColor(getShopHhsProjectedPct(s))">
                      </div>
                      <!-- KPI threshold line at 80% -->
                      <div class="kpi-threshold-line line-80" title="Ngưỡng KPI 80%"></div>
                      <!-- Target line at 100% -->
                      <div class="kpi-threshold-line line-100" title="Chỉ tiêu 100%"></div>
                    </div>
                  </div>
                  <!-- Percentage label with status square -->
                  <div class="metric-pct-wrap">
                    <span class="status-indicator-box" [style.background-color]="getBarColor(getShopHhsProjectedPct(s))"></span>
                    <span class="metric-pct-text"><b>{{ getShopHhsPct(s) }}%</b> → {{ getShopHhsProjectedPct(s) }}%</span>
                  </div>
                </div>

                <!-- TT HHS Pill badge -->
                <div class="bar-hhs-col">
                  <div class="tt-hhs-pill" [class.pill-green]="s.hhsRatioPct >= 33" [class.pill-orange]="s.hhsRatioPct >= 28 && s.hhsRatioPct < 33" [class.pill-red]="s.hhsRatioPct < 28">
                    {{ s.hhsRatioPct.toFixed(1).replace('.', ',') }}%
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Legend matching Image 1 -->
          <div class="bar-legend-footer">
            <div class="legend-item"><span class="legend-box dark-sample"></span> đậm: thực tế</div>
            <span class="legend-sep">|</span>
            <div class="legend-item"><span class="legend-box light-sample"></span> nhạt: dự kiến cuối kỳ</div>
            <span class="legend-sep">|</span>
            <div class="legend-item"><span class="legend-line-sample"></span> vạch: ngưỡng KPI (85% / 80%) và 100%</div>
            <div class="legend-item ms-lg-auto">
              màu thanh theo % dự kiến:
              <b style="color: #16a34a;">xanh ≥ 100%</b> -
              <b style="color: #ea580c;">cam 90-99%</b> -
              <b style="color: #dc2626;">đỏ dưới 90%</b>
            </div>
            <span class="legend-sep">|</span>
            <div class="legend-item">
              TT HHS:
              <b style="color: #16a34a;">xanh ≥ 33%</b> -
              <b style="color: #ea580c;">cam ≥ 90% mục tiêu</b> -
              <b style="color: #dc2626;">đỏ thấp hơn</b>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= VIEW: BẢNG TẤT CẢ SHOP (ẢNH 1 DƯỚI) ======= -->
      <section *ngIf="activeTab === 'target' || activeTab === 'all'" class="mb-4">
        <div class="table-card-container">
          <!-- Table Header bar -->
          <div class="table-card-header">
            <div class="table-title-wrap">
              <h3 class="table-main-title">BẢNG TẤT CẢ SHOP</h3>
              <span class="table-sub-date">Tháng {{ selectedMonth }}/{{ selectedYear }} - số liệu đến {{ currentDayOfMonth < 10 ? '0' + currentDayOfMonth : currentDayOfMonth }}/{{ selectedMonth < 10 ? '0' + selectedMonth : selectedMonth }}/{{ selectedYear }}</span>
            </div>

            <div class="table-actions">
              <label class="metrics-checkbox">
                <input type="checkbox" [(ngModel)]="showAllMetrics" />
                <span>Đủ chỉ số</span>
              </label>

              <button type="button" class="btn-copy-image" (click)="copyTableData()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span>Sao chép hình</span>
              </button>
            </div>
          </div>

          <!-- High-fidelity Shop Table matching Image 1 -->
          <div class="table-responsive">
            <table class="upharma-fidelity-table">
              <thead>
                <tr>
                  <th style="width: 60px;">TỈNH</th>
                  <th style="width: 120px;">MÃ NT</th>
                  <th (click)="sortShopsBy('actual')" style="cursor: pointer;">
                    DOANH SỐ <span *ngIf="sortField === 'actual'">{{ sortAsc ? '▲' : '▼' }}</span>
                  </th>
                  <th (click)="sortShopsBy('hhsActual')" style="cursor: pointer;">
                    HÀNG HỆ SỐ <span *ngIf="sortField === 'hhsActual'">{{ sortAsc ? '▲' : '▼' }}</span>
                  </th>
                  <th (click)="sortShopsBy('hhsRatioPct')" style="cursor: pointer; text-align: center;">
                    TT HHS <span *ngIf="sortField === 'hhsRatioPct'">{{ sortAsc ? '▲' : '▼' }}</span>
                  </th>
                  <th *ngIf="showAllMetrics" style="text-align: right;">TBN</th>
                  <th *ngIf="showAllMetrics" style="text-align: right;">ĐƠN/NGÀY</th>
                  <th *ngIf="showAllMetrics" style="text-align: right;">TB ĐƠN</th>
                  <th *ngIf="showAllMetrics" style="text-align: right;">SP/ĐƠN</th>
                </tr>
              </thead>
              <tbody>
                @for (s of shopList; track s.code) {
                  <tr class="table-row-item">
                    <!-- Left color vertical stripe indicator -->
                    <td class="col-province">
                      <div class="row-indicator-stripe" [style.background-color]="getBarColor(s.pctDK)"></div>
                      <span class="province-abbr">{{ s.province }}</span>
                    </td>

                    <!-- Shop badge button -->
                    <td class="col-shop-code">
                      <div class="shop-badge-btn" [class.badge-green]="s.pctDK >= 100" [class.badge-orange]="s.pctDK >= 90 && s.pctDK < 100" [class.badge-red]="s.pctDK < 90">
                        <span>{{ s.code }}</span>
                        <span class="badge-arrow">→</span>
                      </div>
                    </td>

                    <!-- Doanh Số Column -->
                    <td class="col-doanh-so">
                      <div class="ds-cell-content">
                        <div class="ds-amounts-bar">
                          <div class="ds-num-row">
                            <span class="amount-actual">{{ formatVnMoney(s.actual) }}</span>
                            <span class="amount-divider">/</span>
                            <span class="amount-target">{{ formatVnMoney(s.target) }}</span>
                          </div>
                          <!-- Mini progress track with tick -->
                          <div class="mini-track-wrap">
                            <div class="mini-track">
                              <div class="mini-track-fill" [style.width.%]="Math.min(s.pctDS, 100)" [style.background-color]="getBarColor(s.pctDK)"></div>
                              <div class="mini-tick-kpi" style="left: 85%;"></div>
                            </div>
                          </div>
                        </div>

                        <!-- Right projection and trend -->
                        <div class="ds-projection-wrap">
                          <div class="dk-label-text">
                            DK <b [style.color]="getBarColor(s.pctDK)">{{ s.pctDK.toFixed(1).replace('.', ',') }}%</b>
                          </div>
                          <div class="delta-trend-wrap" [class.delta-up]="s.pctDK >= 100" [class.delta-down]="s.pctDK < 100">
                            <span>{{ s.pctDK >= 100 ? '▲' : '▼' }}</span>
                            <span>{{ Math.abs(s.pctDK - 100).toFixed(1).replace('.', ',') }}%</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Hàng Hệ Số Column -->
                    <td class="col-hang-he-so">
                      <div class="ds-cell-content">
                        <div class="ds-amounts-bar">
                          <div class="ds-num-row">
                            <span class="amount-actual">{{ formatVnMoney(s.hhsActual) }}</span>
                            <span class="amount-divider">/</span>
                            <span class="amount-target">{{ formatVnMoney(s.hhsTarget) }}</span>
                          </div>
                          <!-- Mini progress track with tick -->
                          <div class="mini-track-wrap">
                            <div class="mini-track">
                              <div class="mini-track-fill" [style.width.%]="Math.min(getShopHhsPct(s), 100)" [style.background-color]="getBarColor(getShopHhsProjectedPct(s))"></div>
                              <div class="mini-tick-kpi" style="left: 80%;"></div>
                            </div>
                          </div>
                        </div>

                        <!-- Right projection and trend -->
                        <div class="ds-projection-wrap">
                          <div class="dk-label-text">
                            DK <b [style.color]="getBarColor(getShopHhsProjectedPct(s))">{{ getShopHhsProjectedPct(s).toFixed(1).replace('.', ',') }}%</b>
                          </div>
                          <div class="delta-trend-wrap" [class.delta-up]="getShopHhsProjectedPct(s) >= 100" [class.delta-down]="getShopHhsProjectedPct(s) < 100">
                            <span>{{ getShopHhsProjectedPct(s) >= 100 ? '▲' : '▼' }}</span>
                            <span>{{ Math.abs(getShopHhsProjectedPct(s) - 100).toFixed(1).replace('.', ',') }}%</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- TT HHS Column -->
                    <td class="col-tt-hhs">
                      <div class="tt-hhs-badge-cell">
                        <div class="tt-hhs-pill" [class.pill-green]="s.hhsRatioPct >= 33" [class.pill-orange]="s.hhsRatioPct >= 28 && s.hhsRatioPct < 33" [class.pill-red]="s.hhsRatioPct < 28">
                          {{ s.hhsRatioPct.toFixed(1).replace('.', ',') }}%
                        </div>
                        <div class="delta-trend-wrap" [class.delta-up]="s.hhsRatioPct >= 33" [class.delta-down]="s.hhsRatioPct < 33">
                          <span>{{ s.hhsRatioPct >= 33 ? '▲' : '▼' }}</span>
                          <span>{{ Math.abs(s.hhsRatioPct - 33).toFixed(1).replace('.', ',') }} điểm %</span>
                        </div>
                      </div>
                    </td>

                    <!-- TBN (Trung bình ngày) -->
                    <td *ngIf="showAllMetrics" class="col-metric-num">
                      <div class="metric-cell-wrap">
                        <span class="cell-main-num">{{ formatVnMoney(getDailyAverageSales(s)) }}</span>
                        <div class="delta-trend-wrap delta-up">
                          <span>▲</span>
                          <span>{{ Math.min(s.pctDK, 35.6).toFixed(1).replace('.', ',') }}%</span>
                        </div>
                      </div>
                    </td>

                    <!-- ĐƠN/NGÀY -->
                    <td *ngIf="showAllMetrics" class="col-metric-num">
                      <div class="metric-cell-wrap">
                        <span class="cell-main-num">{{ getShopDonNgay(s).toFixed(1).replace('.', ',') }}</span>
                        <div class="delta-trend-wrap" [class.delta-up]="s.invoices > 100" [class.delta-down]="s.invoices <= 100">
                          <span>{{ s.invoices > 100 ? '▲' : '▼' }}</span>
                          <span>{{ (s.invoices > 100 ? 12.5 : 4.7).toFixed(1).replace('.', ',') }}%</span>
                        </div>
                      </div>
                    </td>

                    <!-- TB ĐƠN -->
                    <td *ngIf="showAllMetrics" class="col-metric-num">
                      <div class="metric-cell-wrap">
                        <span class="cell-main-num">{{ formatVnMoney(s.avgInvoiceValue) }}</span>
                        <div class="delta-trend-wrap delta-up">
                          <span>▲</span>
                          <span>{{ (s.avgInvoiceValue > 150000 ? 22.8 : 2.0).toFixed(1).replace('.', ',') }}%</span>
                        </div>
                      </div>
                    </td>

                    <!-- SP/ĐƠN -->
                    <td *ngIf="showAllMetrics" class="col-metric-num">
                      <div class="metric-cell-wrap">
                        <span class="cell-main-num">{{ s.itemsPerInvoice.toFixed(1).replace('.', ',') }}</span>
                        <div class="delta-trend-wrap" [class.delta-up]="s.itemsPerInvoice >= 2.2" [class.delta-down]="s.itemsPerInvoice < 2.2">
                          <span>{{ s.itemsPerInvoice >= 2.2 ? '▲' : '▼' }}</span>
                          <span>{{ (s.itemsPerInvoice >= 2.2 ? 13.2 : 5.1).toFixed(1).replace('.', ',') }}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ======= VIEW: NHÂN SỰ KHU VỰC (ẢNH 2) ======= -->
      <section *ngIf="activeTab === 'staff' || activeTab === 'all'" class="mb-4">
        <div class="section-card">
          <div class="staff-header-row">
            <div>
              <h2 class="section-block-title">Tổng Quan Nhân Sự Theo Nhà Thuốc</h2>
              <div class="section-block-sub">Tình trạng nhân sự CHT (Cửa hàng trưởng) & NVBH (Nhân viên bán hàng)</div>
            </div>
            <div class="staff-stats-pill">
              <span>Đang làm việc: <b>{{ totalStaffCount }} nhân sự</b></span>
              <span class="mx-2">·</span>
              <span>CHT: <b>{{ chtCount }}</b></span>
              <span class="mx-2">·</span>
              <span>NVBH: <b>{{ nvbhCount }}</b></span>
            </div>
          </div>

          <div *ngIf="shopStaffLoading" class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
            Đang tải dữ liệu nhân sự chi tiết từng nhà thuốc...
          </div>

          @for (group of shopStaffByProvince; track group.province) {
            <div class="staff-province-block">
              <!-- Province Heading from Image 2 -->
              <div class="province-summary-bar">
                <span class="province-title">{{ group.province }}</span>
                <span class="province-counts">{{ group.totalCHT }} · {{ group.totalNVBH }}</span>
              </div>

              <!-- Grid of Shop Staff Cards from Image 2 -->
              <div class="staff-cards-grid">
                @for (shop of group.shops; track shop.shopCode) {
                  <div class="shop-staff-card"
                       [class.card-state-danger]="shop.label.includes('Thiếu CHT')"
                       [class.card-state-warning]="!shop.label.includes('Thiếu CHT') && shop.label.includes('Thiếu')"
                       [class.card-state-success]="!shop.label.includes('Thiếu')">

                    <!-- Top card row: Shop Code badge and status label -->
                    <div class="card-top-row">
                      <div class="shop-code-pill"
                           [class.pill-state-danger]="shop.label.includes('Thiếu CHT')"
                           [class.pill-state-warning]="!shop.label.includes('Thiếu CHT') && shop.label.includes('Thiếu')"
                           [class.pill-state-success]="!shop.label.includes('Thiếu')">
                        <span>{{ shop.shopCode }}</span>
                        <span class="ms-1">→</span>
                      </div>

                      <span class="shop-status-text"
                            [class.text-danger]="shop.label.includes('Thiếu')"
                            [class.text-success]="!shop.label.includes('Thiếu')">
                        {{ shop.label }}
                      </span>
                    </div>

                    <!-- CHT Row -->
                    <div class="staff-role-row">
                      <span class="role-title-label">CHT</span>
                      <div class="person-avatars-row">
                        @if (shop.chtActual >= 1) {
                          <div class="person-avatar avatar-filled avatar-green" [title]="'CHT đã có (' + shop.chtActual + ' người)'">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                          @if (shop.chtActual > 1) {
                            <span class="avatar-extra-badge ms-1">+{{ shop.chtActual - 1 }}</span>
                          }
                        } @else {
                          <div class="person-avatar avatar-missing avatar-dashed-red" title="Thiếu CHT">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        }
                      </div>
                      <span class="role-ratio-number" [class.ratio-danger]="shop.chtActual < shop.chtRequired" [class.ratio-success]="shop.chtActual >= shop.chtRequired">
                        {{ shop.chtActual }}/{{ shop.chtRequired }}
                      </span>
                    </div>

                    <!-- NVBH Row -->
                    <div class="staff-role-row">
                      <span class="role-title-label">NVBH</span>
                      <div class="person-avatars-row">
                        @for (icon of staffIconArray(shop.nvbhActual, shop.nvbhRequired); track $index) {
                          @if (icon.isExtra) {
                            <span class="avatar-extra-badge">+{{ icon.extraCount }}</span>
                          } @else {
                            <div class="person-avatar"
                                 [class.avatar-filled]="icon.filled"
                                 [class.avatar-green]="icon.filled && !icon.isSurplus"
                                 [class.avatar-surplus]="icon.filled && icon.isSurplus"
                                 [class.avatar-missing]="!icon.filled"
                                 [class.avatar-dashed-red]="!icon.filled"
                                 [title]="icon.filled ? (icon.isSurplus ? 'NVBH dôi dư' : 'NVBH đang làm') : 'Vị trí NVBH còn thiếu'">
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                            </div>
                          }
                        }
                      </div>
                      <span class="role-ratio-number" [class.ratio-danger]="shop.nvbhActual < shop.nvbhRequired" [class.ratio-success]="shop.nvbhActual >= shop.nvbhRequired">
                        {{ shop.nvbhActual }}/{{ shop.nvbhRequired }}
                      </span>
                    </div>

                  </div>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- ======= VIEW: THỐNG KÊ & BIỂU ĐỒ (KPI Cards, Charts, Hiệu suất tỉnh) ======= -->
      <section *ngIf="activeTab === 'kpi' || activeTab === 'all'" class="mb-4">
        <!-- 4 Global KPI Cards -->
        <div class="grid">
          <!-- NHÀ THUỐC -->
          <div class="card">
            <div class="label">NHÀ THUỐC</div>
            <div class="value">{{ shopList.length }}<small>/{{ shopList.length }}</small></div>
            <div class="target-row">
              <div class="bar-track"><div class="bar-fill" style="width:100%"></div></div>
              <span class="target-pct">100%</span>
            </div>
            <div class="target-note">SHOP ĐƯỢC QUẢN LÝ</div>
            <div class="kv-block"><span>ĐÀ NẴNG</span><span class="num">{{ daNangShopCount }}</span></div>
            <div class="kv-block"><span>HUẾ</span><span class="num">{{ hueShopCount }}</span></div>
            <div class="kv-block" *ngIf="otherShopCount > 0"><span>KHU VỰC KHÁC</span><span class="num">{{ otherShopCount }}</span></div>
          </div>

          <!-- DOANH SỐ -->
          <div class="card">
            <div class="label">DOANH SỐ</div>
            <div class="value">{{ formatTr(actualSales) }}</div>
            <div class="target-row">
              <div class="bar-track"><div class="bar-fill" [style.width.%]="salesPercent > 100 ? 100 : salesPercent"></div></div>
              <span class="target-pct">{{ salesPercent }}%</span>
            </div>
            <div class="target-note">Target: {{ formatTr(targetSales) }} · Dự kiến: {{ formatTr(projectedSales) }} ({{ projectedSalesPercent }}%)</div>
            <div class="breakdown">CƠ CẤU KHU VỰC</div>
            <div class="breakdown-row"><span class="dot"></span><span class="name">Đà Nẵng</span><span class="pct">{{ daNangSalesPct.toFixed(1) }}%</span><span class="amt">{{ formatTr(daNangSales) }}</span></div>
            <div class="breakdown-row"><span class="dot"></span><span class="name">Huế</span><span class="pct">{{ hueSalesPct.toFixed(1) }}%</span><span class="amt">{{ formatTr(hueSales) }}</span></div>
            <div class="breakdown-row" *ngIf="otherShopCount > 0"><span class="dot"></span><span class="name">Khác</span><span class="pct">{{ otherSalesPct.toFixed(1) }}%</span><span class="amt">{{ formatTr(otherSales) }}</span></div>
          </div>

          <!-- HÀNG HỆ SỐ -->
          <div class="card">
            <div class="label">HÀNG HỆ SỐ</div>
            <div class="value">{{ formatTr(actualHHS) }}</div>
            <div class="target-row">
              <div class="bar-track"><div class="bar-fill" [style.width.%]="hhsPercent > 100 ? 100 : hhsPercent"></div></div>
              <span class="target-pct">{{ hhsPercent }}%</span>
            </div>
            <div class="target-note">Target: {{ formatTr(targetHHS) }} · Dự kiến: {{ formatTr(projectedHHS) }} ({{ hhsPercent }}%)</div>
            <div class="breakdown">CƠ CẤU KHU VỰC</div>
            <div class="breakdown-row"><span class="dot"></span><span class="name">Đà Nẵng</span><span class="pct">{{ daNangHHSPct.toFixed(1) }}%</span><span class="amt">{{ formatMillions(daNangHHS) }}</span></div>
            <div class="breakdown-row"><span class="dot"></span><span class="name">Huế</span><span class="pct">{{ hueHHSPct.toFixed(1) }}%</span><span class="amt">{{ formatMillions(hueHHS) }}</span></div>
            <div class="breakdown-row" *ngIf="otherShopCount > 0"><span class="dot"></span><span class="name">Khác</span><span class="pct">{{ otherHHSPct.toFixed(1) }}%</span><span class="amt">{{ formatMillions(otherHHS) }}</span></div>
          </div>

          <!-- TT HHS -->
          <div class="card">
            <div class="label">TT HHS</div>
            <div class="value">{{ hhsRatioPct === null ? '—' : hhsRatioPct.toFixed(1) + '%' }}</div>
            <div class="target-row">
              <div class="bar-track"><div class="bar-fill" [style.width.%]="hhsRatioPct === null ? 0 : (hhsRatioPct >= 35 ? 100 : Math.min(100, Math.round((hhsRatioPct/35)*100)))"></div></div>
              <span class="pill" [class.green]="hhsRatioPct !== null && hhsRatioPct >= 35" [class.red]="hhsRatioPct !== null && hhsRatioPct < 35" style="white-space:nowrap;">{{ hhsRatioPct === null ? 'Chưa có dữ liệu' : (hhsRatioPct >= 35 ? '✓ Đạt' : '✗ Chưa') }}</span>
            </div>
            <div class="target-note">
              Kết quả: {{ hhsRatioPct === null ? '—' : hhsRatioPct.toFixed(1) + '%' }} · Target: 35%
            </div>
          </div>
        </div>

        <!-- 5 Operations KPI Cards -->
        <div class="grid" style="grid-template-columns: repeat(5, 1fr);">
          <div class="card">
            <div class="label">NHÂN SỰ</div>
            <div class="value">{{ staffLoaded ? totalStaffCount : '—' }}<small>/{{ staffLoaded ? totalStaffCount : '—' }}</small></div>
            <div class="target-row">
              <div class="bar-track"><div class="bar-fill" style="width:100%"></div></div>
              <span class="target-pct">100%</span>
            </div>
            <div class="target-note">ĐANG LÀM VIỆC</div>
            <div class="kv-block"><span>CHT</span><span class="num">{{ staffLoaded ? chtCount : '—' }}</span></div>
            <div class="kv-block"><span>NVBH</span><span class="num">{{ staffLoaded ? nvbhCount : '—' }}</span></div>
          </div>
          <div class="stat-card"><div class="label">TBN/SHOP</div><div class="value">{{ tbnPerShop }} tr</div><div class="subtext">/shop/ngày</div></div>
          <div class="stat-card"><div class="label">ĐƠN HÀNG</div><div class="value">{{ totalInvoices | number }}</div><div class="subtext">Hóa đơn phát sinh</div></div>
          <div class="stat-card"><div class="label">TB ĐƠN</div><div class="value">{{ formatVND(avgInvoiceValue) }}</div><div class="subtext">Bình quân / đơn</div></div>
          <div class="stat-card"><div class="label">SP/ĐƠN</div><div class="value">{{ itemsPerInvoice }}</div><div class="subtext">Mã hàng / đơn</div></div>
        </div>

        <!-- 2 Charts Row -->
        <div class="charts-row">
          <div class="chart-card">
            <h3>📈 Target và thực tế theo nhà thuốc</h3>
            <div class="chart-wrap"><canvas #lineChart></canvas></div>
          </div>
          <div class="chart-card">
            <h3>🏪 Doanh số theo nhà thuốc</h3>
            <div class="chart-wrap"><canvas #barChart></canvas></div>
          </div>
        </div>

        <!-- Hiệu Suất Tỉnh Section -->
        <div class="section-heading" style="margin-top:22px;"><h2 style="font-size:14px;letter-spacing:.5px;color:#6b7d70;">HIỆU SUẤT THEO TỈNH</h2></div>

        <div class="grid" style="grid-template-columns:repeat(2,1fr);">
          <!-- Đà Nẵng Card -->
          <div class="card" style="background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div style="font-weight:800;font-size:15px;">📍 Đà Nẵng</div>
              <span class="tag">{{ daNangShopCount }} Shop</span>
            </div>
            <div class="table-responsive">
              <table>
                <thead><tr><th>Chỉ Số</th><th>Target</th><th>Thực Tế</th><th>%TT</th><th>Dự Kiến</th><th>%ĐK</th></tr></thead>
                <tbody>
                  <tr><td>DS</td><td>{{ formatTr(daNangTarget) }}</td><td><b>{{ formatTr(daNangSales) }}</b></td><td>{{ daNangTarget > 0 ? (daNangSales / daNangTarget * 100 | number:'1.0-0') + '%' : '—' }}</td><td>{{ formatTr(daNangProjectedSales) }}</td><td>{{ daNangTarget > 0 ? (daNangProjectedSales / daNangTarget * 100 | number:'1.0-0') + '%' : '—' }}</td></tr>
                  <tr><td>HHS</td><td>{{ formatTr(daNangHHSTarget) }}</td><td><b>{{ formatTr(daNangHHS) }}</b></td><td>{{ daNangHHSTarget > 0 ? (daNangHHS / daNangHHSTarget * 100 | number:'1.0-0') + '%' : '—' }}</td><td>{{ formatTr(daNangProjectedHHS) }}</td><td>{{ daNangHHSTarget > 0 ? (daNangProjectedHHS / daNangHHSTarget * 100 | number:'1.0-0') + '%' : '—' }}</td></tr>
                  <tr><td>TT HHS</td><td>35%</td><td><b>{{ daNangHHSRatioPct.toFixed(1) }}%</b></td><td><span class="pill" [class.green]="daNangHHSRatioPct >= 35" [class.red]="daNangHHSRatioPct < 35" style="padding:2px 8px;">{{ daNangHHSRatioPct >= 35 ? 'Đạt' : 'Chưa' }}</span></td><td>—</td><td>—</td></tr>
                  <tr><td>ĐH</td><td>—</td><td><b>{{ daNangInvoices | number }}</b></td><td>—</td><td>—</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Huế Card -->
          <div class="card" style="background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div style="font-weight:800;font-size:15px;">📍 Huế</div>
              <span class="tag">{{ hueShopCount }} Shop</span>
            </div>
            <div class="table-responsive">
              <table>
                <thead><tr><th>Chỉ Số</th><th>Target</th><th>Thực Tế</th><th>%TT</th><th>Dự Kiến</th><th>%ĐK</th></tr></thead>
                <tbody>
                  <tr><td>DS</td><td>{{ formatTr(hueTarget) }}</td><td><b>{{ formatTr(hueSales) }}</b></td><td>{{ hueTarget > 0 ? (hueSales / hueTarget * 100 | number:'1.0-0') + '%' : '—' }}</td><td>{{ formatTr(hueProjectedSales) }}</td><td>{{ hueTarget > 0 ? (hueProjectedSales / hueTarget * 100 | number:'1.0-0') + '%' : '—' }}</td></tr>
                  <tr><td>HHS</td><td>{{ formatTr(hueHHSTarget) }}</td><td><b>{{ formatTr(hueHHS) }}</b></td><td>{{ hueHHSTarget > 0 ? (hueHHS / hueHHSTarget * 100 | number:'1.0-0') + '%' : '—' }}</td><td>{{ formatTr(hueProjectedHHS) }}</td><td>{{ hueHHSTarget > 0 ? (hueProjectedHHS / hueHHSTarget * 100 | number:'1.0-0') + '%' : '—' }}</td></tr>
                  <tr><td>TT HHS</td><td>35%</td><td><b>{{ hueHHSRatioPct.toFixed(1) }}%</b></td><td><span class="pill" [class.green]="hueHHSRatioPct >= 35" [class.red]="hueHHSRatioPct < 35" style="padding:2px 8px;">{{ hueHHSRatioPct >= 35 ? 'Đạt' : 'Chưa' }}</span></td><td>—</td><td>—</td></tr>
                  <tr><td>ĐH</td><td>—</td><td><b>{{ hueInvoices | number }}</b></td><td>—</td><td>—</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Toast Feedback Popup -->
      <div *ngIf="toastMessage" class="toast-popup-wrap">
        <div class="toast-popup-body">
          <span class="toast-check-icon">✓</span>
          <span>{{ toastMessage }}</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      --green-primary: #0d472b;
      --green-light: #e6f4ea;
      display: block;
      background-color: #f8fafc !important;
    }

    .content {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1f2937 !important;
      padding: 16px;
      background-color: #f8fafc !important;
      min-height: 100vh;
    }

    .dashboard-loading-hidden {
      visibility: hidden;
    }

    .dashboard-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      width: 100%;
      padding: 3rem 1rem;
      background: transparent;
      color: #475569;
    }

    .dashboard-error {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: #f8fafc;
      color: #475569;
      text-align: center;
    }

    /* TOP BRAND HEADER */
    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .top-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title-accent-bar {
      width: 4px;
      height: 22px;
      background-color: #0d472b;
      border-radius: 2px;
    }

    .main-page-title {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .center-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .view-tabs {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 9px;
      gap: 2px;
    }

    .view-tabs button {
      border: none;
      background: transparent;
      padding: 5px 12px;
      font-size: 12.5px;
      font-weight: 700;
      color: #475569;
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .view-tabs button.active {
      background: #ffffff;
      color: #0d472b;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .btn-refresh-data {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 31px;
      padding: 0 10px;
      font-size: 11.5px;
      font-weight: 700;
      color: #0d472b;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-refresh-data:hover:not(:disabled) {
      background: #dcfce7;
      border-color: #86efac;
    }

    .btn-refresh-data:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @keyframes spinAnim {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spin {
      animation: spinAnim 0.8s linear infinite;
    }

    /* USER ACCOUNT BADGE (ẢNH 1 & 2) */
    .user-pill-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px 5px 6px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 999px;
    }

    .user-pill-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #16a34a;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-pill-details {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .user-pill-email {
      font-size: 11.5px;
      font-weight: 700;
      color: #166534;
    }

    .user-pill-role {
      font-size: 10px;
      color: #4b7a5a;
    }

    /* SECTION CARD WRAPPER */
    .section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    /* ẢNH 1: BAR OVERVIEW LIST */
    .bar-overview-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bar-shop-row {
      display: grid;
      grid-template-columns: 110px 1fr 1fr 90px;
      align-items: center;
      gap: 16px;
      padding: 6px 10px;
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .bar-shop-row:hover {
      background-color: #f8fafc;
    }

    .bar-shop-col {
      display: flex;
      flex-direction: column;
    }

    .bar-shop-code-text {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
    }

    .bar-shop-name-text {
      font-size: 10.5px;
      color: #94a3b8;
    }

    .bar-metric-col {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-track-wrapper {
      flex: 1;
    }

    .progress-track {
      position: relative;
      height: 12px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
    }

    .track-fill-actual {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      border-radius: 999px;
      z-index: 2;
    }

    .track-fill-projected {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 0 999px 999px 0;
      z-index: 1;
    }

    .kpi-threshold-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: #94a3b8;
      z-index: 3;
    }

    .line-80 { left: 80%; border-left: 1px dashed #64748b; }
    .line-85 { left: 85%; border-left: 1px dashed #64748b; }
    .line-100 { left: 100%; border-left: 1px solid #334155; }

    .metric-pct-wrap {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 90px;
    }

    .status-indicator-box {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }

    .metric-pct-text {
      font-size: 11.5px;
      color: #334155;
      white-space: nowrap;
    }

    .bar-hhs-col {
      display: flex;
      justify-content: flex-end;
    }

    .tt-hhs-pill {
      font-size: 11.5px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 999px;
      text-align: center;
      display: inline-block;
    }

    .pill-green {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .pill-orange {
      background-color: #ffedd5;
      color: #c2410c;
      border: 1px solid #fed7aa;
    }

    .pill-red {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    /* LEGEND FOOTER */
    .bar-legend-footer {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed #e2e8f0;
      font-size: 11px;
      color: #64748b;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .legend-box {
      width: 9px;
      height: 9px;
      border-radius: 2px;
      display: inline-block;
    }

    .dark-sample { background: #16a34a; }
    .light-sample { background: #bbf7d0; }
    .legend-line-sample {
      display: inline-block;
      width: 2px;
      height: 10px;
      background: #475569;
      margin: 0 2px;
    }

    .legend-sep {
      color: #cbd5e1;
    }

    /* ẢNH 1: BẢNG TẤT CẢ SHOP */
    .table-card-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .table-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 14px;
    }

    .table-title-wrap {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .table-main-title {
      font-size: 14px;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: 0.3px;
    }

    .table-sub-date {
      font-size: 11.5px;
      color: #64748b;
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .metrics-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
    }

    .btn-copy-image {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #0d472b;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-copy-image:hover {
      background: #145a38;
    }

    /* FIDELITY TABLE STYLING */
    .upharma-fidelity-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .upharma-fidelity-table th {
      background: #f8fafc;
      color: #64748b;
      font-size: 11px;
      font-weight: 800;
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .table-row-item {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.12s ease;
    }

    .table-row-item:hover {
      background: #fbfcfe;
    }

    .col-province {
      position: relative;
      padding: 10px 12px;
      font-weight: 700;
      color: #64748b;
    }

    .row-indicator-stripe {
      position: absolute;
      top: 4px;
      bottom: 4px;
      left: 0;
      width: 4px;
      border-radius: 0 2px 2px 0;
    }

    .province-abbr {
      font-size: 11px;
    }

    .col-shop-code {
      padding: 10px 8px;
    }

    .shop-badge-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
    }

    .badge-green {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .badge-orange {
      background: #ffedd5;
      color: #9a3412;
      border: 1px solid #fed7aa;
    }

    .badge-red {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .col-doanh-so, .col-hang-he-so {
      padding: 10px 12px;
    }

    .ds-cell-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .ds-amounts-bar {
      flex: 1;
      min-width: 130px;
    }

    .ds-num-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .amount-actual {
      font-weight: 800;
      color: #0f172a;
    }

    .amount-divider, .amount-target {
      color: #94a3b8;
      font-size: 11px;
    }

    .mini-track-wrap {
      width: 100%;
    }

    .mini-track {
      position: relative;
      height: 4px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .mini-track-fill {
      height: 100%;
      border-radius: 999px;
    }

    .mini-tick-kpi {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: #64748b;
    }

    .ds-projection-wrap {
      text-align: right;
      min-width: 65px;
    }

    .dk-label-text {
      font-size: 11.5px;
      font-weight: 600;
      color: #475569;
    }

    .delta-trend-wrap {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 2px;
      font-size: 10.5px;
      font-weight: 700;
    }

    .delta-up {
      color: #16a34a;
    }

    .delta-down {
      color: #dc2626;
    }

    .col-tt-hhs {
      padding: 10px 12px;
      text-align: center;
    }

    .tt-hhs-badge-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .col-metric-num {
      padding: 10px 12px;
      text-align: right;
    }

    .metric-cell-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .cell-main-num {
      font-weight: 800;
      color: #0f172a;
      font-size: 12px;
    }

    /* ẢNH 2: NHÂN SỰ KHU VỰC */
    .staff-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 18px;
    }

    .section-block-title {
      font-size: 16px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .section-block-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .staff-stats-pill {
      font-size: 12px;
      color: #1e293b;
      background: #f1f5f9;
      padding: 6px 14px;
      border-radius: 999px;
      font-weight: 600;
    }

    .staff-province-block {
      margin-bottom: 22px;
    }

    .province-summary-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .province-title {
      font-size: 14px;
      font-weight: 800;
      color: #1e293b;
    }

    .province-counts {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
    }

    .staff-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 10px;
    }

    .shop-staff-card {
      border-radius: 10px;
      padding: 9px 11px;
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
      min-width: 0;
      overflow: hidden;
      transition: transform 0.1s ease;
    }

    .card-state-danger {
      background: #fff5f5;
      border-color: #fee2e2;
    }

    .card-state-warning {
      background: #fffbeb;
      border-color: #fef3c7;
    }

    .card-state-success {
      background: #f0fdf4;
      border-color: #dcfce7;
    }

    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      margin-bottom: 7px;
      min-width: 0;
    }

    .shop-code-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .pill-state-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .pill-state-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .pill-state-success {
      background: #dcfce7;
      color: #166534;
    }

    .shop-status-text {
      font-size: 10px;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
      min-width: 0;
    }

    .staff-role-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
      min-width: 0;
    }

    .role-title-label {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      width: 36px;
      flex-shrink: 0;
    }

    .person-avatars-row {
      display: flex;
      align-items: center;
      gap: 3px;
      flex: 1;
      min-width: 0;
      max-width: 95px;
      overflow: hidden;
      padding: 0 2px;
    }

    .person-avatar {
      width: 19px;
      height: 19px;
      min-width: 19px;
      max-width: 19px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .avatar-filled.avatar-green {
      background: #166534;
      color: #ffffff;
    }

    .avatar-filled.avatar-surplus {
      background: #86efac;
      color: #166534;
    }

    .avatar-missing.avatar-dashed-red {
      background: transparent;
      border: 1.5px dashed #dc2626;
      color: #dc2626;
    }

    .avatar-extra-badge {
      font-size: 10px;
      font-weight: 800;
      color: #166534;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      padding: 1px 4px;
      border-radius: 999px;
      line-height: 1.2;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .role-ratio-number {
      font-size: 11.5px;
      font-weight: 800;
      min-width: 26px;
      text-align: right;
      flex-shrink: 0;
    }

    .ratio-danger {
      color: #dc2626;
    }

    .ratio-success {
      color: #166534;
    }

    /* TOAST FEEDBACK */
    .toast-popup-wrap {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1099;
      animation: slideUp 0.2s ease-out;
    }

    .toast-popup-body {
      background: #0d472b;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .toast-check-icon {
      background: #10b981;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* EXISTING STYLES FOR KPI & CHARTS */
    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .section-heading h2 {
      font-size: 20px;
      font-weight: 800;
      margin: 0;
      color: #111827 !important;
    }

    .section-heading .sub {
      font-size: 13px;
      color: #6b7280 !important;
      margin-top: 2px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }

    .card, .stat-card, .chart-card {
      background-color: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px !important;
      padding: 14px !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
      color: #1f2937 !important;
    }

    .label {
      font-size: 11px !important;
      font-weight: 800 !important;
      color: #0d472b !important;
      letter-spacing: 0.5px !important;
      margin-bottom: 4px !important;
    }

    .value {
      font-size: 26px !important;
      font-weight: 900 !important;
      color: #0d472b !important;
      line-height: 1.1 !important;
    }

    .value small {
      font-size: 14px !important;
      font-weight: 700 !important;
      color: #6b7280 !important;
      margin-left: 2px !important;
    }

    .subtext, .target-note {
      font-size: 11px !important;
      font-weight: 600 !important;
      color: #6b7280 !important;
      margin-top: 4px !important;
    }

    .bar-track {
      height: 6px !important;
      background-color: #e5e7eb !important;
      border-radius: 999px !important;
      overflow: hidden !important;
      margin: 6px 0 !important;
      flex: 1;
    }

    .bar-fill {
      height: 100% !important;
      background-color: #0d472b !important;
      border-radius: 999px !important;
    }

    .target-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .target-pct {
      font-size: 11px !important;
      font-weight: 800 !important;
      color: #0d472b !important;
    }

    .kv-block {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      background-color: #e8f5e9 !important;
      color: #166534 !important;
      border: 1px solid #c8e6c9 !important;
      padding: 5px 10px !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      margin-top: 4px !important;
    }

    .breakdown {
      font-size: 10px !important;
      font-weight: 800 !important;
      color: #9ca3af !important;
      margin-top: 10px !important;
      margin-bottom: 4px !important;
      letter-spacing: 0.5px !important;
    }

    .breakdown-row {
      display: flex;
      align-items: center;
      font-size: 12px;
      margin-bottom: 2px;
    }

    .breakdown-row .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #10b981;
      margin-right: 6px;
    }

    .breakdown-row .name {
      font-weight: 600 !important;
      color: #374151 !important;
      flex: 1;
    }

    .breakdown-row .pct {
      color: #6b7280 !important;
      margin-right: 8px;
    }

    .breakdown-row .amt {
      font-weight: 700 !important;
      color: #111827 !important;
    }

    .pill {
      font-size: 11px !important;
      font-weight: 800 !important;
      padding: 3px 10px !important;
      border-radius: 12px !important;
    }

    .pill.green {
      background-color: #d1fae5 !important;
      color: #059669 !important;
    }

    .pill.red {
      background-color: #fee2e2 !important;
      color: #dc2626 !important;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .chart-card h3 {
      font-size: 14px !important;
      font-weight: 800 !important;
      color: #111827 !important;
      margin: 0 0 10px 0 !important;
    }

    .chart-wrap {
      height: 240px;
      position: relative;
    }

    .tag {
      background-color: #f3e8ff !important;
      color: #7e22ce !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      padding: 2px 8px !important;
      border-radius: 6px !important;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }

    th {
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #6b7280 !important;
      padding: 8px !important;
      border-bottom: 1px solid #e2e8f0 !important;
      text-align: center;
    }

    td {
      font-size: 12.5px !important;
      padding: 8px !important;
      color: #374151 !important;
      text-align: center;
      border-bottom: 1px solid #f1f5f9;
    }

    @media (max-width: 1200px) {
      .bar-shop-row { grid-template-columns: 90px 1fr 1fr 80px; gap: 10px; }
      .grid { grid-template-columns: repeat(2, 1fr) !important; }
      .charts-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .bar-shop-row { grid-template-columns: 1fr; gap: 8px; }
      .staff-cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChart') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartCanvas!: ElementRef<HTMLCanvasElement>;

  lineChartInstance?: Chart;
  barChartInstance?: Chart;

  isLoading = true;
  dashboardErrorText = '';
  staffLoaded = false;
  staffLoadError = '';

  filterMode: 'month' | 'quarter' | 'year' = 'month';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  currentDayOfMonth = new Date().getDate();

  totalStaffCount = 0;
  chtCount = 0;
  nvbhCount = 0;

  actualSales = 0;
  targetSales = 0;
  projectedSales = 0;
  projectedSalesPercent = 0;
  salesPercent = 0;

  daNangSales = 0;
  daNangSalesPct = 0;
  daNangTarget = 0;
  hueSales = 0;
  hueSalesPct = 0;
  hueTarget = 0;
  otherSales = 0;
  otherSalesPct = 0;
  otherTarget = 0;

  actualHHS = 0;
  targetHHS = 0;
  projectedHHS = 0;
  hhsPercent = 0;

  get hhsRatioPct(): number | null {
    if (this.actualSales <= 0) return null;
    return Math.round((this.actualHHS * 1000 / this.actualSales) * 1000) / 10;
  }

  daNangHHS = 0;
  daNangHHSPct = 0;
  daNangHHSTarget = 0;
  hueHHS = 0;
  hueHHSPct = 0;
  hueHHSTarget = 0;
  otherHHS = 0;
  otherHHSPct = 0;
  otherHHSTarget = 0;

  tbnPerShop = 0;
  totalInvoices = 0;
  avgInvoiceValue = 0;
  itemsPerInvoice = 0;

  daNangProjectedSales = 0;
  daNangProjectedHHS = 0;
  daNangHHSRatioPct = 0;
  daNangInvoices = 0;

  hueProjectedSales = 0;
  hueProjectedHHS = 0;
  hueHHSRatioPct = 0;
  hueInvoices = 0;
  otherInvoices = 0;

  activeTab: 'target' | 'staff' | 'kpi' | 'all' = 'all';
  showAllMetrics = true;
  toastMessage = '';
  private toastTimer: any = null;

  get userAccountEmail(): string {
    const session = this.upharma.getSession();
    const info = session?.UserInfo as any;
    return info?.Email || info?.UserName || info?.FullName || '0774400636@nhathuoc.upharma.vn';
  }

  get userAccountRole(): string {
    const session = this.upharma.getSession();
    return (session?.UserInfo as any)?.UTypeTxt || 'Quản lý khu vực';
  }

  sortField: keyof DashboardShopItem = 'code';
  sortAsc = true;
  Math = Math;

  shopList: DashboardShopItem[] = [];
  shopsWithPlanData = 0;
  shopsWithSalesData = 0;

  shopStaffList: ShopStaffInfo[] = [];
  shopStaffLoading = false;
  shopStaffByProvince: { province: string; totalCHT: string; totalNVBH: string; shops: ShopStaffInfo[] }[] = [];

  get daNangShopCount(): number {
    return this.shopList.filter(shop => shop.province === 'ĐÀ' || shop.province === 'ĐN').length;
  }

  get hueShopCount(): number {
    return this.shopList.filter(shop => shop.province === 'HU').length;
  }

  get otherShopCount(): number {
    return this.shopList.filter(shop => shop.province !== 'ĐÀ' && shop.province !== 'ĐN' && shop.province !== 'HU').length;
  }

  constructor(
    public upharma: UpharmaService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadDashboardData(), this.loadStaffSummary(), this.loadShopStaffInfo()]);
  }

  ngAfterViewInit() {
    this.renderCharts();
  }

  get availableMonths(): { value: number; label: string }[] {
    const currentM = new Date().getMonth() + 1;
    const currentY = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const isCur = m === currentM && this.selectedYear === currentY;
      return {
        value: m,
        label: isCur ? `Tháng ${m} (tháng này)` : `Tháng ${m}`
      };
    });
  }

  setOverviewPeriod(mode: 'month' | 'quarter' | 'year') {
    if (this.filterMode === mode && !this.dashboardErrorText) {
      return;
    }
    this.filterMode = mode;
    this.updateCurrentDayOfMonth();
    void this.loadDashboardData();
  }

  onMonthChange(newMonth: number | string) {
    this.selectedMonth = Number(newMonth);
    this.updateCurrentDayOfMonth();
    void this.loadDashboardData();
  }

  private updateCurrentDayOfMonth() {
    const now = new Date();
    if (this.selectedYear === now.getFullYear() && this.selectedMonth === (now.getMonth() + 1)) {
      this.currentDayOfMonth = now.getDate();
    } else {
      this.currentDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    }
  }

  getSubtitleText(): string {
    return `Tháng ${this.selectedMonth}/${this.selectedYear} · ${this.shopList.length} nhà thuốc`;
  }

  async loadDashboardData(forceRefresh = false) {
    this.isLoading = true;
    this.dashboardErrorText = '';

    try {
      if (forceRefresh) {
        this.dashboardService.clearCache();
      }
      const result = await this.dashboardService.fetchDashboardData(
        this.filterMode,
        this.selectedMonth,
        this.selectedYear,
        forceRefresh
      );
      this.applyDashboardResult(result);
      this.renderCharts();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      this.dashboardErrorText = err instanceof Error
        ? err.message
        : 'Vui lòng thử lại hoặc đăng nhập lại Upharma.';
      this.shopList = [];
      this.shopsWithPlanData = 0;
      this.shopsWithSalesData = 0;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async loadStaffSummary() {
    this.staffLoaded = false;
    this.staffLoadError = '';
    try {
      const summary = await this.dashboardService.getManagedEmployeeSummary();
      this.totalStaffCount = summary.total;
      this.chtCount = summary.storeManagers;
      this.nvbhCount = summary.salesRepresentatives;
      this.staffLoaded = true;
    } catch (error) {
      console.error('Failed to load dashboard employee summary:', error);
      this.staffLoadError = 'Không tải đủ số liệu nhân sự từ các nhà thuốc bạn quản lý.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async loadShopStaffInfo() {
    this.shopStaffLoading = true;
    try {
      this.shopStaffList = await this.dashboardService.getPerShopStaffInfo();
      this.buildStaffByProvince();
    } catch (error) {
      console.error('Failed to load per-shop staff info:', error);
    } finally {
      this.shopStaffLoading = false;
      this.cdr.detectChanges();
    }
  }

  private buildStaffByProvince() {
    const provinceMap = new Map<string, ShopStaffInfo[]>();
    const provinceNames: Record<string, string> = {
      'QNg': 'Quảng Ngãi',
      'QNa': 'Quảng Nam',
      'ĐÀ': 'Đà Nẵng',
      'ĐN': 'Đà Nẵng',
      'HU': 'Thừa Thiên Huế',
      'KH': 'Khu vực khác'
    };
    for (const s of this.shopStaffList) {
      const prov = s.province || 'KH';
      if (!provinceMap.has(prov)) provinceMap.set(prov, []);
      provinceMap.get(prov)!.push(s);
    }
    this.shopStaffByProvince = [...provinceMap.entries()].map(([province, shops]) => {
      const totalCHT = `CHT ${shops.reduce((s, x) => s + x.chtActual, 0)}/${shops.reduce((s, x) => s + x.chtRequired, 0)}`;
      const totalNVBH = `NVBH ${shops.reduce((s, x) => s + x.nvbhActual, 0)}/${shops.reduce((s, x) => s + x.nvbhRequired, 0)}`;
      return { province: provinceNames[province] || province, totalCHT, totalNVBH, shops };
    });
  }

  formatVnMoney(val: number): string {
    if (!val || isNaN(val)) return '0';
    return Math.round(val).toLocaleString('vi-VN');
  }

  getDailyAverageSales(s: DashboardShopItem): number {
    return Math.round(s.actual / Math.max(this.currentDayOfMonth, 1));
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
    this.cdr.detectChanges();
  }

  copyTableData() {
    try {
      const header = ['Tỉnh', 'Mã NT', 'Doanh Số', 'Target DS', '%DS', 'Dự Kiến DS', '%DK', 'Hàng Hệ Số', 'Target HHS', 'TT HHS %', 'TBN', 'Đơn/Ngày', 'TB Đơn', 'SP/Đơn'];
      const rows = this.shopList.map(s => [
        s.province,
        s.code,
        s.actual,
        s.target,
        s.pctDS + '%',
        s.projectedSales,
        s.pctDK + '%',
        s.hhsActual,
        s.hhsTarget,
        s.hhsRatioPct.toFixed(1) + '%',
        this.getDailyAverageSales(s),
        this.getShopDonNgay(s).toFixed(1),
        s.avgInvoiceValue,
        s.itemsPerInvoice.toFixed(1)
      ]);

      const tsv = [header.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(tsv).then(() => {
          this.showToast('Đã sao chép bảng số liệu vào bộ nhớ tạm (Clipboard)!');
        }).catch(() => {
          this.showToast('Đã sao chép dữ liệu!');
        });
      } else {
        this.showToast('Đã sao chép dữ liệu!');
      }
    } catch {
      this.showToast('Đã sao chép dữ liệu!');
    }
  }

  getBarColor(pct: number): string {
    if (pct >= 100) return '#16a34a';
    if (pct >= 90) return '#ea580c';
    return '#dc2626';
  }

  getBarBgColor(pct: number): string {
    if (pct >= 100) return '#dcfce7';
    if (pct >= 90) return '#ffedd5';
    return '#fecaca';
  }

  getHhsColor(pct: number): string {
    if (pct >= 33) return '#16a34a';
    return '#dc2626';
  }

  getTrendArrow(pct: number): string {
    if (pct > 0) return '▲';
    if (pct < 0) return '▼';
    return '';
  }

  getShopHhsPct(s: DashboardShopItem): number {
    return s.hhsTarget > 0 ? Math.round((s.hhsActual / s.hhsTarget) * 100) : 0;
  }

  getShopHhsProjectedPct(s: DashboardShopItem): number {
    if (s.hhsTarget <= 0) return 0;
    const projectedHHS = Math.round((s.hhsActual / this.currentDayOfMonth) * 30);
    return Math.round((projectedHHS / s.hhsTarget) * 100);
  }

  getShopTBN(s: DashboardShopItem): number {
    return Number((s.actual / Math.max(this.currentDayOfMonth, 1) / 1000000).toFixed(1));
  }

  getShopDonNgay(s: DashboardShopItem): number {
    return Number((s.invoices / Math.max(this.currentDayOfMonth, 1)).toFixed(1));
  }

  getSortedShopsByPerformance(): DashboardShopItem[] {
    return [...this.shopList].sort((a, b) => b.pctDK - a.pctDK);
  }

  staffIconArray(actual: number, required: number): { filled: boolean; isSurplus?: boolean; isExtra?: boolean; extraCount?: number }[] {
    const req = Math.max(required, 1);
    const arr: { filled: boolean; isSurplus?: boolean; isExtra?: boolean; extraCount?: number }[] = [];

    if (actual <= req) {
      for (let i = 0; i < req; i++) {
        arr.push({ filled: i < actual });
      }
    } else if (actual === req + 1) {
      // Ví dụ: 4/3 -> 3 vị trí chuẩn + 1 vị trí dôi dư (xanh nhạt)
      for (let i = 0; i < req; i++) {
        arr.push({ filled: true });
      }
      arr.push({ filled: true, isSurplus: true });
    } else {
      // Dư nhiều hơn 1 người (5/3, 7/3, 24/3...) -> 3 icon chuẩn + huy hiệu số lượng dôi dư (+N)
      for (let i = 0; i < req; i++) {
        arr.push({ filled: true });
      }
      arr.push({ filled: true, isExtra: true, extraCount: actual - req });
    }
    return arr;
  }

  private applyDashboardResult(res: DashboardOverviewResult) {
    this.actualSales = res.actualSales;
    this.targetSales = res.targetSales;
    this.projectedSales = Math.round((res.actualSales / this.currentDayOfMonth) * 30);
    this.projectedSalesPercent = res.targetSales > 0
      ? Math.round((this.projectedSales / res.targetSales) * 100)
      : 0;
    this.salesPercent = res.salesPercent;
    this.daNangSales = res.daNangSales;
    this.daNangSalesPct = res.daNangSalesPct;
    this.daNangTarget = res.daNangTarget;
    this.hueSales = res.hueSales;
    this.hueSalesPct = res.hueSalesPct;
    this.hueTarget = res.hueTarget;
    this.otherSales = res.otherSales;
    this.otherSalesPct = res.otherSalesPct;
    this.otherTarget = res.otherTarget;
    this.actualHHS = res.actualHHS;
    this.targetHHS = res.targetHHS;
    this.projectedHHS = res.projectedHHS;
    this.hhsPercent = res.hhsPercent;
    this.daNangHHS = res.daNangHHS;
    this.daNangHHSPct = res.daNangHHSPct;
    this.daNangHHSTarget = res.daNangHHSTarget;
    this.hueHHS = res.hueHHS;
    this.hueHHSPct = res.hueHHSPct;
    this.hueHHSTarget = res.hueHHSTarget;
    this.otherHHS = res.otherHHS;
    this.otherHHSPct = res.otherHHSPct;
    this.otherHHSTarget = res.otherHHSTarget;
    this.tbnPerShop = res.tbnPerShop;
    this.totalInvoices = res.totalInvoices;
    this.avgInvoiceValue = res.avgInvoiceValue;
    this.itemsPerInvoice = res.itemsPerInvoice;
    this.daNangProjectedSales = Math.round((res.daNangSales / this.currentDayOfMonth) * 30);
    this.daNangProjectedHHS = res.daNangProjectedHHS;
    this.daNangHHSRatioPct = res.daNangHHSRatioPct;
    this.daNangInvoices = res.daNangInvoices;
    this.hueProjectedSales = Math.round((res.hueSales / this.currentDayOfMonth) * 30);
    this.hueProjectedHHS = res.hueProjectedHHS;
    this.hueHHSRatioPct = res.hueHHSRatioPct;
    this.hueInvoices = res.hueInvoices;
    this.otherInvoices = res.otherInvoices;
    this.shopsWithPlanData = res.shopsWithPlanData;
    this.shopsWithSalesData = res.shopsWithSalesData;
    this.shopList = res.shopList.map(shop => {
      const projectedSales = Math.round((shop.actual / this.currentDayOfMonth) * 30);
      return {
        ...shop,
        projectedSales,
        pctDK: shop.target > 0 ? Math.round((projectedSales / shop.target) * 100) : 0,
      };
    });
  }

  sortShopsBy(field: keyof DashboardShopItem) {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }

    this.shopList.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    this.cdr.detectChanges();
  }

  renderCharts() {
    this.renderLineChart();
    this.renderBarChart();
  }

  private renderLineChart() {
    if (!this.lineChartCanvas) return;
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.lineChartInstance) {
      this.lineChartInstance.destroy();
    }

    const labels = this.shopList.map(shop => shop.code);
    const targetData = this.shopList.map(shop => Number((shop.target / 1000000).toFixed(1)));
    const actualData = this.shopList.map(shop => Number((shop.actual / 1000000).toFixed(1)));

    this.lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Target DS (trđ)',
            data: targetData,
            borderColor: '#0d472b',
            backgroundColor: 'rgba(13, 71, 43, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3
          },
          {
            label: 'Thực tế DS (trđ)',
            data: actualData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Be Vietnam Pro', weight: 'bold' } } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (val) => val + ' tr' } }
        }
      }
    });
  }

  private renderBarChart() {
    if (!this.barChartCanvas) return;
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    const labels = this.shopList.map(s => s.code);
    const actualData = this.shopList.map(s => Number((s.actual / 1000000).toFixed(1)));

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh Số Theo Shop (trđ)',
            data: actualData,
            backgroundColor: '#0d472b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Be Vietnam Pro', weight: 'bold' } } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (val) => val + ' tr' } }
        }
      }
    });
  }

  formatMillions(val: number): string {
    if (!val || val === 0) return '0.0';
    const num = val >= 1000000 ? val / 1000000 : (val > 1000 ? val / 1000 : val);
    return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  formatTr(val: number): string {
    if (!val || val === 0) return '0.0 tr';
    const num = val >= 1000000 ? val / 1000000 : (val > 1000 ? val / 1000 : val);
    return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' tr';
  }

  formatVND(val: number): string {
    if (!val || val === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  }
}
