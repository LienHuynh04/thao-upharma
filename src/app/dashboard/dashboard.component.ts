import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UpharmaService } from '../upharma.service';
import { DashboardService, DashboardShopItem, DashboardOverviewResult } from './dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div *ngIf="isLoading" class="dashboard-loading" role="status">Đang tải dữ liệu tổng quan...</div>
    <div *ngIf="dashboardErrorText" class="dashboard-error" role="alert">
      <strong>Không thể tải đủ dữ liệu tổng quan.</strong>
      <span>{{ dashboardErrorText }}</span>
      <button type="button" class="btn btn-sm btn-outline-success" (click)="loadDashboardData()">Thử tải lại</button>
      <a routerLink="/login" class="btn btn-sm btn-danger text-white">Đăng nhập lại</a>
    </div>
    <div class="content" id="content" [class.dashboard-loading-hidden]="isLoading || !!dashboardErrorText">
      <!-- Top Section Heading -->
      <div class="section-heading">
        <div>
          <h2>Tổng Quan Khu Vực</h2>
          <div class="sub">{{ getSubtitleText() }}</div>
        </div>
        <div class="period-toggle">
          <button [class.active]="filterMode === 'month'" (click)="setOverviewPeriod('month')">Tháng</button>
          <button [class.active]="filterMode === 'quarter'" (click)="setOverviewPeriod('quarter')">Quý</button>
          <button [class.active]="filterMode === 'year'" (click)="setOverviewPeriod('year')">Năm</button>
        </div>
      </div>

      <!-- Grid 1: 4 KPI Cards -->
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
          <div class="kv-block"><span>ĐN</span><span class="num">{{ daNangShopCount }}</span></div>
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
          <div class="target-note">Target: {{ formatTr(targetSales) }} &nbsp;·&nbsp; Dự kiến: {{ formatTr(projectedSales) }} ({{ salesPercent }}%)</div>
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
          <div class="target-note">Target: {{ formatTr(targetHHS) }} &nbsp;·&nbsp; Dự kiến: {{ formatTr(projectedHHS) }} ({{ hhsPercent }}%)</div>
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
            <span class="pill" [class.green]="hhsRatioPct !== null && hhsRatioPct >= 35" [class.red]="hhsRatioPct !== null && hhsRatioPct < 35" style="white-space:nowrap;">{{ hhsRatioPct === null ? 'Thiếu dữ liệu' : (hhsRatioPct >= 35 ? '✓ Đạt' : '✗ Chưa') }}</span>
          </div>
          <div class="target-note">Target: 35% · Có chỉ tiêu: {{ shopsWithPlanData }}/{{ shopList.length }} nhà thuốc</div>
        </div>
      </div>

      <!-- Grid 2: 5 Operation KPI Cards -->
      <div class="grid" style="grid-template-columns:repeat(5,1fr);">
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
          <div *ngIf="staffLoadError" class="small text-danger mt-2">{{ staffLoadError }}</div>
        </div>
        <div class="stat-card"><div class="label">TBN/SHOP</div><div class="value">{{ tbnPerShop }} tr</div><div class="subtext">/shop/ngày</div></div>
        <div class="stat-card"><div class="label">ĐƠN HÀNG</div><div class="value">{{ totalInvoices | number }}</div><div class="subtext">Hóa đơn phát sinh</div></div>
        <div class="stat-card"><div class="label">TB ĐƠN</div><div class="value">{{ formatVND(avgInvoiceValue) }}</div><div class="subtext">Bình quân / đơn</div></div>
        <div class="stat-card"><div class="label">SP/ĐƠN</div><div class="value">{{ itemsPerInvoice }}</div><div class="subtext">Mã hàng / đơn</div></div>
      </div>

      <!-- Charts Row: DS + HHS Theo Ngày & Doanh Số Theo Nhà Thuốc -->
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
      <div class="section-heading" style="margin-top:22px;"><h2 style="font-size:13px;letter-spacing:.5px;color:#6b7d70;">HIỆU SUẤT TỈNH</h2></div>

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
        <div class="card" style="background:#fff;" *ngIf="otherShopCount > 0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-weight:800;font-size:15px;">📍 Khu vực khác</div>
            <span class="tag">{{ otherShopCount }} Shop</span>
          </div>
          <div class="table-responsive">
            <table>
              <thead><tr><th>Chỉ Số</th><th>Target</th><th>Thực Tế</th><th>%TT</th></tr></thead>
              <tbody>
                <tr><td>DS</td><td>{{ formatTr(otherTarget) }}</td><td><b>{{ formatTr(otherSales) }}</b></td><td>{{ otherTarget > 0 ? (otherSales / otherTarget * 100 | number:'1.0-0') + '%' : '—' }}</td></tr>
                <tr><td>HHS</td><td>{{ formatTr(otherHHSTarget) }}</td><td><b>{{ formatTr(otherHHS) }}</b></td><td>{{ otherHHSTarget > 0 ? (otherHHS / otherHHSTarget * 100 | number:'1.0-0') + '%' : '—' }}</td></tr>
                <tr><td>ĐH</td><td>—</td><td><b>{{ otherInvoices | number }}</b></td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bảng Tất Cả Shop Section -->
      <div class="section-heading" style="margin-top:22px;">
        <div>
          <h2>Bảng Tất Cả Shop</h2>
          <div class="sub">{{ shopsWithPlanData }}/{{ shopList.length }} nhà thuốc có dữ liệu chỉ tiêu · bấm vào tên cột để sắp xếp</div>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead><tr>
            <th style="cursor:pointer;" (click)="sortShopsBy('province')">Tỉnh</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('code')">Mã</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('target')">Target DS</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('actual')">Thực Tế</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('pctDS')">%DS</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('projectedSales')">Dự Kiến</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('pctDK')">%ĐK</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('hhsActual')">HHS</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('hhsRatioPct')">TT HHS</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('invoices')">Đơn Hàng</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('avgInvoiceValue')">TB Đơn</th>
            <th style="cursor:pointer;" (click)="sortShopsBy('itemsPerInvoice')">SP/Đơn</th>
            <th>Trạng thái dữ liệu</th>
          </tr></thead>
          <tbody>
            @for (s of shopList; track s.code) {
              <tr>
                <td><span class="tag">{{ s.province }}</span></td>
                <td class="code">{{ s.code }}</td>
                <td>{{ s.target > 0 ? formatTr(s.target) : '—' }}</td>
                <td><b>{{ s.actual > 0 ? formatTr(s.actual) : '0.0 tr' }}</b></td>
                <td>{{ s.pctDS > 0 ? s.pctDS + '%' : '—' }}</td>
                <td>{{ s.projectedSales > 0 ? formatTr(s.projectedSales) : '0.0 tr' }}</td>
                <td>{{ s.pctDK > 0 ? s.pctDK + '%' : '—' }}</td>
                <td>{{ s.hhsActual > 0 ? formatTr(s.hhsActual) : '0.0 tr' }}</td>
                <td>{{ s.hhsRatioPct.toFixed(1) }}%</td>
                <td>{{ s.invoices > 0 ? (s.invoices | number) : '0' }}</td>
                <td>{{ s.avgInvoiceValue > 0 ? formatVND(s.avgInvoiceValue) : '0đ' }}</td>
                <td>{{ s.itemsPerInvoice }}</td>
                <td [class.text-secondary]="!s.hasPlanData">{{ s.statusText }}</td>
              </tr>
            }
          </tbody>
        </table>
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
      position: fixed;
      inset: 56px 0 0;
      z-index: 20;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
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

    .period-toggle {
      display: flex;
      background-color: #e2e8f0 !important;
      padding: 3px;
      border-radius: 8px;
      gap: 2px;
    }

    .period-toggle button {
      border: none;
      background: transparent;
      padding: 5px 16px;
      font-size: 13px;
      font-weight: 700;
      color: #4b5563 !important;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }

    .period-toggle button.active {
      background-color: #ffffff !important;
      color: #0d472b !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }

    .card, .stat-card, .chart-card {
      background-color: #ffffff !important;
      background: #ffffff !important;
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

    td.code {
      font-weight: 800 !important;
      color: #111827 !important;
    }

    .placeholder-page {
      background-color: #f8fafc !important;
      border: 1px dashed #cbd5e1 !important;
      border-radius: 8px !important;
      text-align: center !important;
      color: #64748b !important;
      font-size: 13px !important;
    }

    .btn-primary {
      background-color: #0d472b;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
    }

    @media (max-width: 1200px) {
      .grid { grid-template-columns: repeat(2, 1fr) !important; }
      .charts-row { grid-template-columns: 1fr; }
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
  selectedMonth = 10;
  selectedYear = 2026;

  totalStaffCount = 0;
  chtCount = 0;
  nvbhCount = 0;

  actualSales = 0;
  targetSales = 0;
  projectedSales = 0;
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
  hhsRatioPct: number | null = null;

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

  sortField: keyof DashboardShopItem = 'code';
  sortAsc = true;
  Math = Math;

  shopList: DashboardShopItem[] = [];
  shopsWithPlanData = 0;

  get daNangShopCount(): number {
    return this.shopList.filter(shop => shop.province === 'ĐÀ').length;
  }

  get hueShopCount(): number {
    return this.shopList.filter(shop => shop.province === 'HU').length;
  }

  get otherShopCount(): number {
    return this.shopList.filter(shop => shop.province !== 'ĐÀ' && shop.province !== 'HU').length;
  }

  constructor(
    public upharma: UpharmaService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadDashboardData(), this.loadStaffSummary()]);
  }

  ngAfterViewInit() {
    this.renderCharts();
  }

  setOverviewPeriod(mode: 'month' | 'quarter' | 'year') {
    if (this.filterMode === mode && !this.dashboardErrorText) {
      return;
    }
    this.filterMode = mode;
    void this.loadDashboardData();
  }

  getSubtitleText(): string {
    if (this.filterMode === 'quarter') {
      const q = Math.ceil(this.selectedMonth / 3);
      return `Quý ${q}/${this.selectedYear} · ${this.shopList.length} nhà thuốc`;
    } else if (this.filterMode === 'year') {
      return `Năm ${this.selectedYear} · ${this.shopList.length} nhà thuốc`;
    }
    return `Tháng ${this.selectedMonth}/${this.selectedYear} · ${this.shopList.length} nhà thuốc`;
  }

  async loadDashboardData() {
    this.isLoading = true;
    this.dashboardErrorText = '';

    try {
      const result = await this.dashboardService.fetchDashboardData(
        this.filterMode,
        this.selectedMonth,
        this.selectedYear
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

  private applyDashboardResult(res: DashboardOverviewResult) {
    this.actualSales = res.actualSales;
    this.targetSales = res.targetSales;
    this.projectedSales = res.projectedSales;
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
    this.hhsRatioPct = res.hhsRatioPct;
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
    this.daNangProjectedSales = res.daNangProjectedSales;
    this.daNangProjectedHHS = res.daNangProjectedHHS;
    this.daNangHHSRatioPct = res.daNangHHSRatioPct;
    this.daNangInvoices = res.daNangInvoices;
    this.hueProjectedSales = res.hueProjectedSales;
    this.hueProjectedHHS = res.hueProjectedHHS;
    this.hueHHSRatioPct = res.hueHHSRatioPct;
    this.hueInvoices = res.hueInvoices;
    this.otherInvoices = res.otherInvoices;
    this.shopsWithPlanData = res.shopsWithPlanData;
    this.shopList = res.shopList;
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
