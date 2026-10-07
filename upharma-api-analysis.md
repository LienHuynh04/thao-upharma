# BÁO CÁO PHÂN TÍCH TOÀN BỘ API UPHARMA (ICPC1HN)

Tài liệu phân tích chuyên sâu toàn bộ danh mục API hệ thống Nhà thuốc **UPHARMA / ICPC1HN** từ trang trợ giúp chính thức [Help Documentation](https://icpc1hn.work/NHATHUOC/Help).

---

## 📊 THỐNG KÊ TỔNG QUAN HỆ THỐNG API

| Chỉ số (Metric) | Giá trị (Value) | Ghi chú |
| :--- | :--- | :--- |
| **Tổng số Endpoints** | **657** | Bao gồm tất cả 83 phân hệ |
| **HTTP POST** | **642** | Các API xử lý nghiệp vụ & truy vấn dữ liệu |
| **HTTP GET** | **15** | Các API đọc dữ liệu public / static |
| **HTTP PUT** | **0** | Cập nhật dữ liệu |
| **HTTP DELETE** | **0** | Xóa dữ liệu |
| **Tổng số Request Schemas** | **97** | Các Model dữ liệu gửi đi |
| **Tổng số Response Schemas** | **97** | Các Model dữ liệu phản hồi |
| **Tổng số Schemas trong Components** | **194** | Đã định nghĩa trong `components.schemas` |
| **Số API DOCUMENTED** | **492** | Đã được mô tả đầy đủ Model trong Help Page |
| **Số API OBSERVED** | **76** | Đã được xác minh qua Response thực tế |
| **Số API PARTIAL** | **89** | Chỉ có wrapper Model, thiếu child item schema |
| **Số API INFERRED** | **0** | Suy luận từ mẫu dữ liệu |

---

## 🛡️ CÁC PHÂN HỆ NÒNG CỐT ĐÃ ĐƯỢC CHUẨN HÓA MODEL

1. **User / Login**: API đăng nhập (`/User/Login`), thông tin tài khoản, quyền hạn.
2. **ShopPlan**: Kế hoạch chỉ tiêu nhà thuốc (`/ShopPlan/GetShopPlanByTime`).
3. **EmployeePlan**: Kế hoạch chỉ tiêu nhân viên (`/EmployeePlan/GetEmployeePlanLst`).
4. **SalesInvoice**: Xử lý đơn hàng bán lẻ, báo cáo doanh số (`/SalesInvoice/GetReportSalesByShop`).
5. **LocalStore**: Tồn kho chi nhánh nhà thuốc (`/LocalStore/GetLocalStoreLst`).
6. **Buyer**: Đơn vị mua hàng, đối tác.
7. **CancelProduct**: Hủy sản phẩm lỗi / hết hạn.
8. **ImportSystem**: Nhập kho hệ thống.
9. **TransferOrder**: Đặt đơn nội bộ & điều chuyển kho.
10. **Product**: Danh mục sản phẩm & giá bán.
11. **Inventory**: Kiểm kê & tồn kho an toàn.
12. **ShiftWork**: Phân ca làm việc nhân viên.

---

## 📋 BẢNG CHI TIẾT 657 ENDPOINTS API

| API | Method | Endpoint | Request Model | Response Model | Mục đích | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST TOOLProduct/CreateProduct` | `POST` | `/TOOLProduct/CreateProduct` | `TOOLCreateProductReq` | `TOOLCreateProductRes` | Tạo CCDC | **PARTIAL** |
| `POST TOOLProduct/UpdateProduct` | `POST` | `/TOOLProduct/UpdateProduct` | `TOOLUpdateProductReq` | `TOOLUpdateProductRes` | Cập nhật CCDC | **PARTIAL** |
| `POST TOOLProduct/DelProduct` | `POST` | `/TOOLProduct/DelProduct` | `TOOLDelProductReq` | `TOOLDelProductRes` | Xóa CCDC | **PARTIAL** |
| `POST TOOLProduct/GetProductLst` | `POST` | `/TOOLProduct/GetProductLst` | `TOOLGetProductLstReq` | `TOOLGetProductLstRes` | Láy danh sách CCDC | **PARTIAL** |
| `POST InventorySafe/GetInventorySystemSafe` | `POST` | `/InventorySafe/GetInventorySystemSafe` | `NTGetInventorySystemSafeReq` | `NTGetInventorySystemSafeRes` | Tạo mới phiếu kiểm kê | **PARTIAL** |
| `POST InventorySafe/SetInventorySystemSafe` | `POST` | `/InventorySafe/SetInventorySystemSafe` | `NTSetInventorySystemSafeReq` | `NTSetInventorySystemSafeRes` | Tạo mới phiếu kiểm kê | **PARTIAL** |
| `POST InventorySafe/GetInventoryShopSafe` | `POST` | `/InventorySafe/GetInventoryShopSafe` | `NTGetInventoryShopSafeReq` | `NTGetInventoryShopSafeRes` | Tạo mới phiếu kiểm kê | **PARTIAL** |
| `POST InventorySafe/SetInventoryShopSafe` | `POST` | `/InventorySafe/SetInventoryShopSafe` | `NTSetInventoryShopSafeReq` | `NTSetInventoryShopSafeRes` | Tạo mới phiếu kiểm kê | **PARTIAL** |
| `POST InventorySafe/DelInventoryShopSafe` | `POST` | `/InventorySafe/DelInventoryShopSafe` | `NTDelInventoryShopSafeReq` | `NTDelInventoryShopSafeRes` | Xóa tồn kho an toàn | **PARTIAL** |
| `POST InventorySafe/DelInventorySystemSafe` | `POST` | `/InventorySafe/DelInventorySystemSafe` | `NTDelInventorySystemSafeReq` | `NTDelInventorySystemSafeRes` | Xóa tồn kho an toàn mặc định | **PARTIAL** |
| `POST NTMessage/CreateMessage` | `POST` | `/NTMessage/CreateMessage` | `NTCreateMessageReq` | `NTCreateMessageRes` | Tạo mới thông báo | **PARTIAL** |
| `POST NTMessage/UpdateMessage` | `POST` | `/NTMessage/UpdateMessage` | `NTUpdateMessageReq` | `NTUpdateMessageRes` | Cập nhật thông báo | **PARTIAL** |
| `POST NTMessage/DelMessage` | `POST` | `/NTMessage/DelMessage` | `NTDelMessageReq` | `NTDelMessageRes` | Hủy thông báo | **PARTIAL** |
| `POST NTMessage/GetMessageByTime` | `POST` | `/NTMessage/GetMessageByTime` | `NTGetMessageByTimeReq` | `NTGetMessageByTimeRes` | Lấy danh sách thông báo | **PARTIAL** |
| `POST NTMessage/GetMessageByID` | `POST` | `/NTMessage/GetMessageByID` | `NTGetMessageByIDReq` | `NTGetMessageByIDRes` | Lấy chi tiết thông báo | **PARTIAL** |
| `POST NTMessage/ConfirmMessage` | `POST` | `/NTMessage/ConfirmMessage` | `NTConfirmMessageReq` | `NTConfirmMessageRes` | Xác nhận đọc thông báo | **PARTIAL** |
| `POST ReturnShop/CreateReturnShop` | `POST` | `/ReturnShop/CreateReturnShop` | `NTCreateReturnShopReq` | `NTCreateReturnShopRes` | Tạo lại phiếu trả lại hàng | **PARTIAL** |
| `POST ReturnShop/DelReturnShop` | `POST` | `/ReturnShop/DelReturnShop` | `NTDelReturnShopReq` | `NTDelReturnShopRes` | Xóa phiếu trả lại hàng | **PARTIAL** |
| `POST ReturnShop/GetReturnShopByTime` | `POST` | `/ReturnShop/GetReturnShopByTime` | `NTGetReturnShopByTimeReq` | `NTGetReturnShopByTimeRes` | Lấy phiếu trả lại hàng | **PARTIAL** |
| `POST ReturnShop/GetReturnShopByApprove` | `POST` | `/ReturnShop/GetReturnShopByApprove` | `NTGetReturnShopByTimeReq` | `NTGetReturnShopByTimeRes` | Lấy phiếu trả lại hàng | **PARTIAL** |
| `POST ReturnShop/GetReturnShopByID` | `POST` | `/ReturnShop/GetReturnShopByID` | `NTGetReturnShopByIDReq` | `NTGetReturnShopByIDRes` | Lấy phiếu trả lại hàng theo ID | **PARTIAL** |
| `POST ReturnShop/ApproveReturnShop` | `POST` | `/ReturnShop/ApproveReturnShop` | `NTApproveReturnShopReq` | `NTApproveReturnShopRes` | Phê duyệt phiếu trả lại hàng theo ID | **PARTIAL** |
| `POST ReturnShop/GetInvoiceSalesByLotIndex` | `POST` | `/ReturnShop/GetInvoiceSalesByLotIndex` | `NTGetInvoiceSalesByLotIndexReq` | `NTGetInvoiceSalesByLotIndexRes` | Lấy danh sách đơn hàng theo mã nhảy | **PARTIAL** |
| `POST ReturnShop/GetLotIndexBySalesH` | `POST` | `/ReturnShop/GetLotIndexBySalesH` | `NTGetLotIndexBySalesHReq` | `NTGetLotIndexBySalesHRes` | Lấy danh sách đơn hàng theo mã nhảy | **PARTIAL** |
| `POST User/UserLogin` | `POST` | `/User/UserLogin` | `NTUserLoginReq` | `NTUserLoginRes` | Đăng nhập hệ thống | **OBSERVED** |
| `POST User/UpdateUserInfo` | `POST` | `/User/UpdateUserInfo` | `NTUpdateUserInfoReq` | `NTUpdateUserInfoRes` | Cập nhật thông tin User | **OBSERVED** |
| `POST User/GetUserInfoByID` | `POST` | `/User/GetUserInfoByID` | `NTGetUserInfoByIDReq` | `NTGetUserInfoByIDRes` | Lấy thông tin User | **OBSERVED** |
| `POST User/ChangePassword` | `POST` | `/User/ChangePassword` | `NTChangePasswordReq` | `NTChangePasswordRes` | Cập nhật thông tin User | **OBSERVED** |
| `POST User/LotPassword` | `POST` | `/User/LotPassword` | `NTLotPasswordReq` | `NTLotPasswordRes` | Quên mật khẩu | **OBSERVED** |
| `POST User/CheckOTPLostPassword` | `POST` | `/User/CheckOTPLostPassword` | `NTCheckOTPLostPasswordReq` | `NTCheckOTPLostPasswordRes` | Check OTP quên mật khẩu | **OBSERVED** |
| `POST User/UserRegister` | `POST` | `/User/UserRegister` | `NTUserRegisterReq` | `NTUserRegisterRes` | Đăng ký tài khoản | **OBSERVED** |
| `POST MOMOPay/CreatePaymentQR` | `POST` | `/MOMOPay/CreatePaymentQR` | `MMCreatePaymentQRReq` | `MMCreatePaymentQRRes` | Thanh toán qua QR | **PARTIAL** |
| `POST MOMOPay/CreateIPN` | `POST` | `/MOMOPay/CreateIPN` | `MMCreateIPNReq` | `MMCreateIPNRes` | IPN | **PARTIAL** |
| `POST MOMOPay/CreatePaymentCard` | `POST` | `/MOMOPay/CreatePaymentCard` | `MMCreatePaymentCardReq` | `MMCreatePaymentCardRes` | Thanh toán qua thiết bị EDC (Máy Pos) | **PARTIAL** |
| `POST MOMOPay/GetQRPaymentLst` | `POST` | `/MOMOPay/GetQRPaymentLst` | `MOMOGetQRPaymentLstReq` | `MOMOGetQRPaymentLstRes` | Lấy thông tin thanh toán | **PARTIAL** |
| `POST TOOLImportSystem/CreateImportSysHeader` | `POST` | `/TOOLImportSystem/CreateImportSysHeader` | `TOOLCreateImportSysHeaderReq` | `TOOLCreateImportSysHeaderRes` | Tạo phiếu nhập CCDC | **PARTIAL** |
| `POST TOOLImportSystem/UpdateImportSysHeader` | `POST` | `/TOOLImportSystem/UpdateImportSysHeader` | `TOOLUpdateImportSysHeaderReq` | `TOOLUpdateImportSysHeaderRes` | Cập nhật phiếu nhập CCDC | **PARTIAL** |
| `POST TOOLImportSystem/DelImportSysHeader` | `POST` | `/TOOLImportSystem/DelImportSysHeader` | `TOOLDelImportSysHeaderReq` | `TOOLDelImportSysHeaderRes` | Xóa phiếu nhập CCDC | **PARTIAL** |
| `POST TOOLImportSystem/ApproveImportSysHeader` | `POST` | `/TOOLImportSystem/ApproveImportSysHeader` | `TOOLApproveImportSysHeaderReq` | `TOOLApproveImportSysHeaderRes` | Phê duyệt phiếu nhập CCDC | **PARTIAL** |
| `POST TOOLImportSystem/GetImportSysHeaderLst` | `POST` | `/TOOLImportSystem/GetImportSysHeaderLst` | `TOOLGetImportSysHeaderLstReq` | `TOOLGetImportSysHeaderLstRes` | Lấy danh sách duyệt phiếu nhập CCDC | **PARTIAL** |
| `POST TOOLImportSystem/GetImportSysHeaderByID` | `POST` | `/TOOLImportSystem/GetImportSysHeaderByID` | `TOOLGetImportSysHeaderByIDReq` | `TOOLGetImportSysHeaderByIDRes` | Lấy chi tiết duyệt phiếu nhập CCDC | **PARTIAL** |
| `POST ShopPlan/UpdateShopPlan` | `POST` | `/ShopPlan/UpdateShopPlan` | `UPUpdateShopPlanReq` | `UPUpdateShopPlanRes` | Tạo mới kế hoạch | **OBSERVED** |
| `POST ShopPlan/ApproveShopPlan` | `POST` | `/ShopPlan/ApproveShopPlan` | `UPApproveShopPlanReq` | `UPApproveShopPlanRes` | Phê duyệt kế hoạch | **OBSERVED** |
| `POST ShopPlan/GetShopPlanByTime` | `POST` | `/ShopPlan/GetShopPlanByTime` | `UPGetShopPlanByTimeReq` | `UPGetShopPlanByTimeRes` | Lấy danh sách kế hoạch | **OBSERVED** |
| `POST ImportSystem/CreateImportSys` | `POST` | `/ImportSystem/CreateImportSys` | `NTCreateImportSysReq` | `NTCreateImportSysRes` | Thêm mới đơn hàng | **PARTIAL** |
| `POST ImportSystem/UpdateImportSys` | `POST` | `/ImportSystem/UpdateImportSys` | `NTUpdateImportSysReq` | `NTUpdateImportSysRes` | Cập nhật đơn hàng | **PARTIAL** |
| `POST ImportSystem/UpdateImportSysApprove` | `POST` | `/ImportSystem/UpdateImportSysApprove` | `NTUpdateImportSysApproveReq` | `NTUpdateImportSysApproveRes` | Cập nhật đơn hàng | **PARTIAL** |
| `POST ImportSystem/DelImportSys` | `POST` | `/ImportSystem/DelImportSys` | `NTDelImportSysReq` | `NTDelImportSysRes` | Xóa đơn hàng | **PARTIAL** |
| `POST ImportSystem/ApproveImportSys` | `POST` | `/ImportSystem/ApproveImportSys` | `NTApproveImportSysReq` | `NTApproveImportSysRes` | Phê duyệt phiếu nhập hàng | **PARTIAL** |
| `POST ImportSystem/GetImportSysHeaderByID` | `POST` | `/ImportSystem/GetImportSysHeaderByID` | `NTGetImportSysHeaderByIDReq` | `NTGetImportSysHeaderByIDRes` | Phê duyệt phiếu nhập hàng | **PARTIAL** |
| `POST ImportSystem/GetImportSysHeaderLst` | `POST` | `/ImportSystem/GetImportSysHeaderLst` | `NTGetImportSysHeaderLstReq` | `NTGetImportSysHeaderLstRes` | Phê duyệt phiếu nhập hàng | **PARTIAL** |
| `POST ImportSystem/GetImportLotLineLst` | `POST` | `/ImportSystem/GetImportLotLineLst` | `NTGetImportLotLineLstReq` | `NTGetImportLotLineLstRes` | Lấy danh sách số lô nhảy của sản phẩm | **PARTIAL** |
| `POST ImportSystem/GetLotCodeInfoBySys` | `POST` | `/ImportSystem/GetLotCodeInfoBySys` | `NTGetLotCodeInfoBySysReq` | `NTGetLotCodeInfoBySysRes` | Lấy danh sách số lô nhảy của sản phẩm | **PARTIAL** |
| `POST ImportSystem/GetProductImportLast` | `POST` | `/ImportSystem/GetProductImportLast` | `NTGetProductImportLastReq` | `NTGetProductImportLastRes` | Lấy danh sách số lô nhảy của sản phẩm | **PARTIAL** |
| `POST ImportSystem/CheckStampImportSys` | `POST` | `/ImportSystem/CheckStampImportSys` | `NTCheckStampImportSysReq` | `NTCheckStampImportSysRes` | Lấy danh sách số lô nhảy của sản phẩm | **PARTIAL** |
| `POST ImportSystem/FastGetImportSysHeaderLst` | `POST` | `/ImportSystem/FastGetImportSysHeaderLst` | `FastGetImportSysHeaderLstReq` | `FastGetImportSysHeaderLstRes` | Lấy thông tin đơn nhập trên Fast | **PARTIAL** |
| `POST ImportSystem/FastGetImportSysLineLst` | `POST` | `/ImportSystem/FastGetImportSysLineLst` | `FastGetImportSysLineLstReq` | `FastGetImportSysLineLstRes` | Lấy thông tin đơn nhập trên Fast | **PARTIAL** |
| `POST ImportSystem/GetLotCode` | `POST` | `/ImportSystem/GetLotCode` | `NTGetLotCodeReq` | `NTGetLotCodeRes` | Kiểm tra thông tin Lô | **PARTIAL** |
| `POST DefaultValue/GetDefaultValue` | `POST` | `/DefaultValue/GetDefaultValue` | `NTGetDefaultValueReq` | `NTGetDefaultValueRes` | Lấy giá trị default | **PARTIAL** |
| `POST DefaultValue/GetLocation` | `POST` | `/DefaultValue/GetLocation` | `NTGetLocationReq` | `NTGetLocationRes` | Lấy giá trị default | **PARTIAL** |
| `POST DefaultValue/GetDataLocation` | `POST` | `/DefaultValue/GetDataLocation` | `NTGetDataLocationReq` | `NTGetDataLocationRes` | Lấy giá trị default | **PARTIAL** |
| `POST DefaultValue/GetUserDefineLst` | `POST` | `/DefaultValue/GetUserDefineLst` | `NTGetUserDefineLstReq` | `NTGetUserDefineLstRes` | Lấy giá trị default | **OBSERVED** |
| `POST DefaultValue/GetStoreTypeLst` | `POST` | `/DefaultValue/GetStoreTypeLst` | `NTGetStoreTypeLstReq` | `NTGetStoreTypeLstRes` | Lấy giá trị default | **PARTIAL** |
| `POST DefaultValue/SentMailReport` | `POST` | `/DefaultValue/SentMailReport` | `NTSentMailReportReq` | `NTSentMailReportRes` | Gửi báo cáo | **PARTIAL** |
| `POST Product/AddNewProduct` | `POST` | `/Product/AddNewProduct` | `NTAddNewProductReq` | `NTAddNewProductRes` | Thêm mới sản phẩm | **PARTIAL** |
| `POST Product/UpdateProductInfo` | `POST` | `/Product/UpdateProductInfo` | `NTUpdateProductInfoReq` | `NTUpdateProductInfoRes` | Cập nhật sản phẩm | **PARTIAL** |
| `POST Product/UpdateProductDose` | `POST` | `/Product/UpdateProductDose` | `NTUpdateProductDoseReq` | `NTUpdateProductDoseRes` | Cập nhật sản phẩm | **PARTIAL** |
| `POST Product/UpdateProductContraindicated` | `POST` | `/Product/UpdateProductContraindicated` | `NTUpdateProductContraindicatedReq` | `NTUpdateProductContraindicatedRes` | Cập nhật sản phẩm | **PARTIAL** |
| `POST Product/UpdateProductPackage` | `POST` | `/Product/UpdateProductPackage` | `NTUpdateProductPackageReq` | `NTUpdateProductPackageRes` | Cập nhật sản phẩm | **PARTIAL** |
| `POST Product/GetProductPackageLst` | `POST` | `/Product/GetProductPackageLst` | `NTGetProductPackageLstReq` | `NTGetProductPackageLstRes` | Lấy thông tin các loại đóng gói | **PARTIAL** |
| `POST Product/GetProductPackageByPIDLst` | `POST` | `/Product/GetProductPackageByPIDLst` | `NTGetProductPackageByPIDLstReq` | `NTGetProductPackageByPIDLstRes` | Lấy thông tin mã đóng gói của ds sản phẩm | **PARTIAL** |
| `POST Product/GetProductDose` | `POST` | `/Product/GetProductDose` | `NTGetProductDoseReq` | `NTGetProductDoseRes` | Lấy thông tin liều dùng sản phẩm | **PARTIAL** |
| `POST Product/UpdateProductRelationship` | `POST` | `/Product/UpdateProductRelationship` | `NTUpdateProductRelationshipReq` | `NTUpdateProductRelationshipRes` | Cập nhật sản phẩm | **PARTIAL** |
| `POST Product/DelProductRelationship` | `POST` | `/Product/DelProductRelationship` | `NTDelProductRelationshipReq` | `NTDelProductRelationshipRes` | Xóa sản phẩm tương tự | **PARTIAL** |
| `POST Product/GetProductRelationship` | `POST` | `/Product/GetProductRelationship` | `NTGetProductRelationshipReq` | `NTGetProductRelationshipRes` | Lấy danh sách sản phẩm tương tự | **PARTIAL** |
| `POST Product/DelProductByID` | `POST` | `/Product/DelProductByID` | `NTDelProductByIDReq` | `NTDelProductByIDRes` | Hủy sản phẩm | **PARTIAL** |
| `POST Product/GetProductInfo` | `POST` | `/Product/GetProductInfo` | `NTGetProductInfoReq` | `NTGetProductInfoRes` | Lấy thông tin chi tiết sản phẩm | **PARTIAL** |
| `POST Product/GetSimplyProductInfo` | `POST` | `/Product/GetSimplyProductInfo` | `NTGetProductInfoReq` | `NTGetProductInfoRes` | Lấy thông tin chi tiết sản phẩm | **PARTIAL** |
| `POST Product/GetProductActivatedLst` | `POST` | `/Product/GetProductActivatedLst` | `NTGetProductActivatedLstReq` | `NTGetProductActivatedLstRes` | Lấy thông tin chi tiết sản phẩm | **PARTIAL** |
| `POST Product/GetItemLst` | `POST` | `/Product/GetItemLst` | `NTGetItemLstReq` | `NTGetItemLstRes` | Lấy danh sách sản phẩm | **PARTIAL** |
| `POST Product/GetItemLstWithFollower` | `POST` | `/Product/GetItemLstWithFollower` | `NTGetItemLstReq` | `NTGetItemLstRes` | Lấy danh sách sản phẩm theo người Follower | **PARTIAL** |
| `POST Product/GetProductPostLst` | `POST` | `/Product/GetProductPostLst` | `NTGetProductPostLstReq` | `NTGetProductPostLstRes` | Lấy danh sách sản phẩm | **PARTIAL** |
| `POST Product/GetItemModelLst` | `POST` | `/Product/GetItemModelLst` | `NTGetItemModelLstReq` | `NTGetItemModelLstRes` | Lấy danh sách sản phẩm gợi ý | **PARTIAL** |
| `POST Product/GetProductSupplies` | `POST` | `/Product/GetProductSupplies` | `NTGetProductSuppliesReq` | `NTGetProductSuppliesRes` | Lấy danh sách vật tư | **PARTIAL** |
| `POST StoreFollow/GetStoreFollowLst` | `POST` | `/StoreFollow/GetStoreFollowLst` | `NTGetStoreFollowLstReq` | `NTGetStoreFollowLstRes` | Lấy thông tin phân loại kho | **PARTIAL** |
| `POST StoreFollow/UpdateStoreFollowLst` | `POST` | `/StoreFollow/UpdateStoreFollowLst` | `NTUpdateStoreFollowLstReq` | `NTUpdateStoreFollowLstRes` | Lấy thông tin phân loại kho | **PARTIAL** |
| `POST PolicyVoucher/GetPolicyVoucherLst` | `POST` | `/PolicyVoucher/GetPolicyVoucherLst` | `NTGetPolicyVoucherLstReq` | `NTGetPolicyVoucherLstRes` | Lây danh sách cài đặt Voucher | **PARTIAL** |
| `POST PolicyVoucher/AddPolicyVoucher` | `POST` | `/PolicyVoucher/AddPolicyVoucher` | `NTAddPolicyVoucherReq` | `NTAddPolicyVoucherRes` | Thêm Voucher vào hệ thống | **PARTIAL** |
| `POST PolicyVoucher/UpdateSttVoucher` | `POST` | `/PolicyVoucher/UpdateSttVoucher` | `NTUpdateSttVoucherReq` | `NTUpdateSttVoucherRes` | Cập nhật trạng thái voucher | **PARTIAL** |
| `POST PolicyVoucher/AddPolicyVoucherLst` | `POST` | `/PolicyVoucher/AddPolicyVoucherLst` | `NTAddPolicyVoucherLstReq` | `NTAddPolicyVoucherLstRes` | Thêm danh sách Voucher vào hệ thống | **PARTIAL** |
| `POST PolicyVoucher/DelPolicyVoucher` | `POST` | `/PolicyVoucher/DelPolicyVoucher` | `NTDelPolicyVoucherReq` | `NTDelPolicyVoucherRes` | Xóa Voucher vào hệ thống | **PARTIAL** |
| `POST PolicyVoucher/GetPolicyVoucherInfo` | `POST` | `/PolicyVoucher/GetPolicyVoucherInfo` | `NTGetPolicyVoucherInfoReq` | `NTGetPolicyVoucherInfoRes` | Lấy thông tin Voucher | **PARTIAL** |
| `POST PolicyVoucher/GetVoucherOfCustomer` | `POST` | `/PolicyVoucher/GetVoucherOfCustomer` | `NTGetVoucherOfCustomerReq` | `NTGetVoucherOfCustomerRes` | Lấy thông tin Voucher của khách hàng | **PARTIAL** |
| `POST OrderNew/CreateOrderProductNew` | `POST` | `/OrderNew/CreateOrderProductNew` | `NTCreateOrderProductNewReq` | `NTCreateOrderProductNewRes` | - | **PARTIAL** |
| `POST OrderNew/UpdateOrderProductNew` | `POST` | `/OrderNew/UpdateOrderProductNew` | `NTUpdateOrderProductNewReq` | `NTUpdateOrderProductNewRes` | - | **PARTIAL** |
| `POST OrderNew/DelOrderProductNew` | `POST` | `/OrderNew/DelOrderProductNew` | `NTDelOrderProductNewReq` | `NTDelOrderProductNewRes` | - | **PARTIAL** |
| `POST OrderNew/GetOrderProductNewByTime` | `POST` | `/OrderNew/GetOrderProductNewByTime` | `NTGetOrderProductNewByTimeReq` | `NTGetOrderProductNewByTimeRes` | - | **PARTIAL** |
| `POST OrderNew/ApproveOrderProductNew` | `POST` | `/OrderNew/ApproveOrderProductNew` | `NTApproveOrderProductNewReq` | `NTApproveOrderProductNewRes` | - | **PARTIAL** |
| `POST OrderNew/GetOrderProductNewLine` | `POST` | `/OrderNew/GetOrderProductNewLine` | `NTGetOrderProductNewLineReq` | `NTGetOrderProductNewLineRes` | - | **PARTIAL** |
| `POST OrderNew/AddOrderProductNewLine` | `POST` | `/OrderNew/AddOrderProductNewLine` | - | - | - | **DOCUMENTED** |
| `POST OrderNew/DelOrderProductNewLine` | `POST` | `/OrderNew/DelOrderProductNewLine` | `NTDelOrderProductNewLineReq` | `NTDelOrderProductNewLineRes` | - | **PARTIAL** |
| `POST OrderNew/GetOrderProductNewLByTime` | `POST` | `/OrderNew/GetOrderProductNewLByTime` | - | - | - | **DOCUMENTED** |
| `POST InvoiceOnline/GetInvoiceOrderOnByTime` | `POST` | `/InvoiceOnline/GetInvoiceOrderOnByTime` | - | - | Lấy danh sách đơn hàng trên WEB theo thời gian Online | **DOCUMENTED** |
| `POST InvoiceOnline/GetInvoiceOrderOnByID` | `POST` | `/InvoiceOnline/GetInvoiceOrderOnByID` | - | - | Lấy danh sách đơn hàng trên WEB theo thời gian Online | **DOCUMENTED** |
| `POST InvoiceOnline/GetLotCodeInfoBySys` | `POST` | `/InvoiceOnline/GetLotCodeInfoBySys` | - | - | Kiểm tra thông tin lô nhảy trong kho Online | **DOCUMENTED** |
| `POST InvoiceOnline/CreateOrderOnline` | `POST` | `/InvoiceOnline/CreateOrderOnline` | - | - | Tạo đơn đặt Online | **DOCUMENTED** |
| `POST InvoiceOnline/UpdateSttOrderHeader` | `POST` | `/InvoiceOnline/UpdateSttOrderHeader` | - | - | Cập nhật trạng thái dơn hàng | **DOCUMENTED** |
| `POST InvoiceOnline/ConfirmOrderHeaderByID` | `POST` | `/InvoiceOnline/ConfirmOrderHeaderByID` | - | - | Xác nhận hoàn thành đơn hàng | **DOCUMENTED** |
| `POST InvoiceOnline/DelOrderHeader` | `POST` | `/InvoiceOnline/DelOrderHeader` | - | - | Hủy đơn hàng | **DOCUMENTED** |
| `POST InvoiceOnline/RejectOrderOnline` | `POST` | `/InvoiceOnline/RejectOrderOnline` | - | - | Nhà thuốc từ chối xử lý đơn | **DOCUMENTED** |
| `POST SampleDisease/SearchSampleDisease` | `POST` | `/SampleDisease/SearchSampleDisease` | - | - | Tìm kiếm đơn mẫu theo triệu trứng bệnh | **DOCUMENTED** |
| `POST SampleDisease/GetSampleDisease` | `POST` | `/SampleDisease/GetSampleDisease` | - | - | Lấy thông tin đơn mẫu | **DOCUMENTED** |
| `POST SampleDisease/SearchInvoiceImage` | `POST` | `/SampleDisease/SearchInvoiceImage` | - | - | Lấy thông tin đơn mẫu | **DOCUMENTED** |
| `POST EmployeePlan/UpdateEmployeePlan` | `POST` | `/EmployeePlan/UpdateEmployeePlan` | - | - | Cập nhật kế hoạch nhân viên | **OBSERVED** |
| `POST EmployeePlan/ApproveEmployeePlan` | `POST` | `/EmployeePlan/ApproveEmployeePlan` | - | - | Phê duyệt kế hoạch nhân viên | **OBSERVED** |
| `POST EmployeePlan/GetEmployeePlanLst` | `POST` | `/EmployeePlan/GetEmployeePlanLst` | - | - | Lấy danh sách kế hoạch nhân viên | **OBSERVED** |
| `POST EmployeePlan/GetEmployeePlanDetailByEm` | `POST` | `/EmployeePlan/GetEmployeePlanDetailByEm` | - | - | Lấy danh sách kế hoạch nhân viên | **OBSERVED** |
| `POST VNPayInvoice/CreateInvoiceFAST` | `POST` | `/VNPayInvoice/CreateInvoiceFAST` | - | - | Đẩy thông tin hóa đơn MTT | **DOCUMENTED** |
| `POST VNPayInvoice/UpSalesInvoiceFAST` | `POST` | `/VNPayInvoice/UpSalesInvoiceFAST` | - | - | Đẩy thông tin hóa đơn MTT + FAST | **OBSERVED** |
| `POST VNPayInvoice/UpSalesInvoiceByID` | `POST` | `/VNPayInvoice/UpSalesInvoiceByID` | - | - | Đẩy thông tin hóa đơn MTT + FAST theo ID | **OBSERVED** |
| `POST VNPayInvoice/GetElectronicInvoiceInfo` | `POST` | `/VNPayInvoice/GetElectronicInvoiceInfo` | - | - | Lấy thông tin cài đặt hóa đơn từ máy tính tiền | **DOCUMENTED** |
| `POST VNPayInvoice/SetElectronicInvoiceInfo` | `POST` | `/VNPayInvoice/SetElectronicInvoiceInfo` | - | - | cài đặt hóa đơn từ máy tính tiền | **DOCUMENTED** |
| `POST SupplierFollower/GetUserSupplier` | `POST` | `/SupplierFollower/GetUserSupplier` | - | - | Lấy thông tin phân quyền theo dõi khách hàng | **OBSERVED** |
| `POST SupplierFollower/AddUserSupplier` | `POST` | `/SupplierFollower/AddUserSupplier` | - | - | Phân công theo dõi nhà cung cấp | **OBSERVED** |
| `POST SupplierFollower/DelUserSupplier` | `POST` | `/SupplierFollower/DelUserSupplier` | - | - | Xóa phân công theo dõi nhà cung cấp | **OBSERVED** |
| `POST ConnectSYT/SYTGetSalesHeaderByID` | `POST` | `/ConnectSYT/SYTGetSalesHeaderByID` | - | - | Lấy thông tin đơn hàng theo ID | **DOCUMENTED** |
| `POST ConnectSYT/SYTGetSalesHeaderByShop` | `POST` | `/ConnectSYT/SYTGetSalesHeaderByShop` | - | - | Lấy thông danh sách đơn hàng của Shop | **DOCUMENTED** |
| `POST ConnectSYT/SYTUploadSalesInvoice` | `POST` | `/ConnectSYT/SYTUploadSalesInvoice` | - | - | Cập nhật thông tin kết nối SYT | **OBSERVED** |
| `POST ConnectSYT/SYTDelSalesInvoice` | `POST` | `/ConnectSYT/SYTDelSalesInvoice` | - | - | Hủy thông tin kết nối SYT | **OBSERVED** |
| `POST ConnectSYT/SYTGetImportStore` | `POST` | `/ConnectSYT/SYTGetImportStore` | - | - | Lấy thông tin nhập của nhà thuốc | **DOCUMENTED** |
| `POST ConnectSYT/SYTGetImportStoreByHId` | `POST` | `/ConnectSYT/SYTGetImportStoreByHId` | - | - | Lấy thông tin nhập chi tiết của nhà thuốc | **DOCUMENTED** |
| `POST ConnectSYT/SYTUploadImportHeader` | `POST` | `/ConnectSYT/SYTUploadImportHeader` | - | - | - | **DOCUMENTED** |
| `POST ConnectSYT/SYTDelImportHeader` | `POST` | `/ConnectSYT/SYTDelImportHeader` | - | - | - | **DOCUMENTED** |
| `POST ConnectSYT/SYTGetItemLst` | `POST` | `/ConnectSYT/SYTGetItemLst` | - | - | - | **DOCUMENTED** |
| `POST ConnectSYT/SearchInvoiceDQG` | `POST` | `/ConnectSYT/SearchInvoiceDQG` | - | - | Tra cứu đơn dược quốc gia | **DOCUMENTED** |
| `POST ConnectSYT/UpInvoiceDQG` | `POST` | `/ConnectSYT/UpInvoiceDQG` | - | - | Cập nhật đơn quốc gia | **DOCUMENTED** |
| `POST WEB/GetShopLst` | `POST` | `/WEB/GetShopLst` | - | - | Lấy danh sách nhà thuốc | **DOCUMENTED** |
| `POST WEB/GetProductGroupLst` | `POST` | `/WEB/GetProductGroupLst` | - | - | Lấy danh sách phân nhóm nhà thuốc | **DOCUMENTED** |
| `POST WEB/GetProductInfo` | `POST` | `/WEB/GetProductInfo` | - | - | Lấy thông tin chi tiết nhà thuốc | **DOCUMENTED** |
| `POST WEB/GetItemLst` | `POST` | `/WEB/GetItemLst` | - | - | Lấy danh sách thuốc | **DOCUMENTED** |
| `POST WEB/GetItemHotLst` | `POST` | `/WEB/GetItemHotLst` | - | - | Lấy danh sách thuốc Hot | **DOCUMENTED** |
| `POST WEB/GetItemLstWithOption` | `POST` | `/WEB/GetItemLstWithOption` | - | - | Lấy danh sách thuốc | **DOCUMENTED** |
| `POST WEB/GetDefaultValueWeb` | `POST` | `/WEB/GetDefaultValueWeb` | - | - | Lấy danh sách thuốc | **DOCUMENTED** |
| `POST WEB/UpdateProductInfo` | `POST` | `/WEB/UpdateProductInfo` | - | - | Lấy danh sách thuốc | **DOCUMENTED** |
| `POST WEB/CheckInventory` | `POST` | `/WEB/CheckInventory` | - | - | Lấ danh sách tồn kho ở các shop | **DOCUMENTED** |
| `POST WEB/UploadImageProduct?ProductID={ProductID}&Token={Token}&UserName={UserName}&TimeStart={TimeStart}&TimeEnd={TimeEnd}&IsKM={IsKM}` | `POST` | `/WEB/UploadImageProduct?ProductID={ProductID}&Token={Token}&UserName={UserName}&TimeStart={TimeStart}&TimeEnd={TimeEnd}&IsKM={IsKM}` | - | - | Upload ảnh của sản phẩm | **OBSERVED** |
| `POST WEB/UploadImageProductMore?ProductID={ProductID}&Token={Token}&UserName={UserName}&TypeImage={TypeImage}` | `POST` | `/WEB/UploadImageProductMore?ProductID={ProductID}&Token={Token}&UserName={UserName}&TypeImage={TypeImage}` | - | - | Upload ảnh của sản phẩm (nhiều ảnh) | **OBSERVED** |
| `POST WEB/DelImageProductKM?ProductID={ProductID}&Token={Token}&UserName={UserName}` | `POST` | `/WEB/DelImageProductKM?ProductID={ProductID}&Token={Token}&UserName={UserName}` | - | - | Xóa ảnh KM | **OBSERVED** |
| `POST WEB/DelImageProductMore?ProductID={ProductID}&TypeImage={TypeImage}&Token={Token}&UserName={UserName}` | `POST` | `/WEB/DelImageProductMore?ProductID={ProductID}&TypeImage={TypeImage}&Token={Token}&UserName={UserName}` | - | - | Xóa ảnh chi tiết sản phẩm | **OBSERVED** |
| `POST WEB/UploadImageDes?Token={Token}&UserName={UserName}` | `POST` | `/WEB/UploadImageDes?Token={Token}&UserName={UserName}` | - | - | Upload ảnh trong bài viết | **OBSERVED** |
| `POST WEB/DelImageDes?ImageName={ImageName}&Token={Token}&UserName={UserName}` | `POST` | `/WEB/DelImageDes?ImageName={ImageName}&Token={Token}&UserName={UserName}` | - | - | Xóa ảnh trong bài viết | **OBSERVED** |
| `GET WEB/DownloadImageDes?ImageName={ImageName}` | `GET` | `/WEB/DownloadImageDes?ImageName={ImageName}` | - | - | Hàm lấy ảnh trong bài viết | **DOCUMENTED** |
| `GET WEB/DownloadImageMore?ProductID={ProductID}&TypeImage={TypeImage}&Ratio={Ratio}` | `GET` | `/WEB/DownloadImageMore?ProductID={ProductID}&TypeImage={TypeImage}&Ratio={Ratio}` | - | - | Hàm lấy ảnh trong bài viết | **DOCUMENTED** |
| `POST Organization/AddOrganization` | `POST` | `/Organization/AddOrganization` | - | - | Thêm tổ chức | **DOCUMENTED** |
| `POST Organization/UpdateOrganization` | `POST` | `/Organization/UpdateOrganization` | - | - | Cập nhật tổ chức | **DOCUMENTED** |
| `POST Organization/UpdateOrganizationDetail` | `POST` | `/Organization/UpdateOrganizationDetail` | - | - | Cập nhật chi tiết tổ chức | **DOCUMENTED** |
| `POST Organization/GetOrganizationByID` | `POST` | `/Organization/GetOrganizationByID` | - | - | Lấy thông tin tổ chức theo ID | **DOCUMENTED** |
| `POST Organization/GetOrganizationLst` | `POST` | `/Organization/GetOrganizationLst` | - | - | Lấy danh sách tổ chức | **DOCUMENTED** |
| `POST Organization/GetOrganizationDetailLst` | `POST` | `/Organization/GetOrganizationDetailLst` | - | - | Lấy chi tiết danh sách tổ chức | **DOCUMENTED** |
| `POST Organization/GetUserOrganizationLst` | `POST` | `/Organization/GetUserOrganizationLst` | - | - | Lấy danh sách tổ chức | **OBSERVED** |
| `POST Organization/SetUserOrganization` | `POST` | `/Organization/SetUserOrganization` | - | - | Lấy danh sách tổ chức | **OBSERVED** |
| `POST Organization/AddSalesmanByShop` | `POST` | `/Organization/AddSalesmanByShop` | - | - | CHT: Thêm mới nhân viên bán hàng vào Shop | **DOCUMENTED** |
| `POST Organization/GetSalesmanByShop` | `POST` | `/Organization/GetSalesmanByShop` | - | - | CHT: Lấy thông tin nhân viên bán hàng của Shop | **DOCUMENTED** |
| `POST Organization/DelSalesmanByShop` | `POST` | `/Organization/DelSalesmanByShop` | - | - | CHT: Xóa nhân viên bán hàng khỏi Shop | **DOCUMENTED** |
| `POST Organization/GetFileShopLst` | `POST` | `/Organization/GetFileShopLst` | - | - | Lấy danh sách File của Shop | **DOCUMENTED** |
| `POST Organization/DelFileShop` | `POST` | `/Organization/DelFileShop` | - | - | Xóa File | **DOCUMENTED** |
| `POST Organization/AddOrganizationTemp` | `POST` | `/Organization/AddOrganizationTemp` | - | - | Thêm thông tin nhiệt kế | **DOCUMENTED** |
| `POST Organization/UpdateOrganizationTemp` | `POST` | `/Organization/UpdateOrganizationTemp` | - | - | Cập nhật thông tin nhiệt kế | **DOCUMENTED** |
| `POST Organization/DelOrganizationTemp` | `POST` | `/Organization/DelOrganizationTemp` | - | - | Xóa thông tin nhiệt kế | **DOCUMENTED** |
| `POST Organization/GetOrganizationTemp` | `POST` | `/Organization/GetOrganizationTemp` | - | - | Lấy thông tin nhiệt kế | **DOCUMENTED** |
| `POST ImportStore/CreateImportStore` | `POST` | `/ImportStore/CreateImportStore` | - | - | Thêm biên bản nhập kho | **DOCUMENTED** |
| `POST ImportStore/GetImportStore` | `POST` | `/ImportStore/GetImportStore` | - | - | Lấy danh sách biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/GetImportStoreByHId` | `POST` | `/ImportStore/GetImportStoreByHId` | - | - | Lấy thông tin biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/UpdateImportStore` | `POST` | `/ImportStore/UpdateImportStore` | - | - | Cập nhật thông tin biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/DelImportStore` | `POST` | `/ImportStore/DelImportStore` | - | - | Xóa biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/ApproveImportLine` | `POST` | `/ImportStore/ApproveImportLine` | - | - | Duyệt dòng hàng phiếu nhập kho | **DOCUMENTED** |
| `POST ImportStore/GetLotTransferLst` | `POST` | `/ImportStore/GetLotTransferLst` | - | - | Duyệt dòng hàng phiếu nhập kho | **DOCUMENTED** |
| `POST ImportStore/ApproveImportStore` | `POST` | `/ImportStore/ApproveImportStore` | - | - | Duyệt phiếu nhập kho | **DOCUMENTED** |
| `POST ImportStore/ConfirmPacking` | `POST` | `/ImportStore/ConfirmPacking` | - | - | Xác nhận đã đóng kiểm hàng | **DOCUMENTED** |
| `POST PolicyPrice/GetPriceBaseByTime` | `POST` | `/PolicyPrice/GetPriceBaseByTime` | - | - | Lấy danh sách giá vốn theo thời gian | **DOCUMENTED** |
| `POST PolicyPrice/CreatePriceOrder` | `POST` | `/PolicyPrice/CreatePriceOrder` | - | - | - | **DOCUMENTED** |
| `POST PolicyPrice/UpdatePriceOrder` | `POST` | `/PolicyPrice/UpdatePriceOrder` | - | - | - | **DOCUMENTED** |
| `POST PolicyPrice/GetPriceOrderByTime` | `POST` | `/PolicyPrice/GetPriceOrderByTime` | - | - | - | **DOCUMENTED** |
| `POST DraftTransferOrder/GetTransferOrderLineByShop` | `POST` | `/DraftTransferOrder/GetTransferOrderLineByShop` | - | - | - | **DOCUMENTED** |
| `POST DraftTransferOrder/ModifyTransferOrderLine` | `POST` | `/DraftTransferOrder/ModifyTransferOrderLine` | - | - | - | **DOCUMENTED** |
| `POST api/v1/notify-trans` | `POST` | `/api/v1/notify-trans` | - | - | API lấy danh sách sản phẩm hủy | **DOCUMENTED** |
| `POST TOOLLocalStore/GetInventoryByStore` | `POST` | `/TOOLLocalStore/GetInventoryByStore` | - | - | Lấy danh sách tồn kho | **OBSERVED** |
| `POST TOOLLocalStore/GetInventoryDetailByPID` | `POST` | `/TOOLLocalStore/GetInventoryDetailByPID` | - | - | Lấy danh sách tồn kho các tem | **OBSERVED** |
| `POST TOOLLocalStore/GetLotCodeIndex` | `POST` | `/TOOLLocalStore/GetLotCodeIndex` | - | - | Lấy thông tin tem | **OBSERVED** |
| `POST TOOLLocalStore/UpLotCodeIndexFast` | `POST` | `/TOOLLocalStore/UpLotCodeIndexFast` | - | - | Cập nhật thông tin tem | **OBSERVED** |
| `POST CustomerCard/GetCustomerCardLst` | `POST` | `/CustomerCard/GetCustomerCardLst` | - | - | Lấy danh sách thẻ khách hàng | **DOCUMENTED** |
| `POST CustomerCard/AddCustomerCard` | `POST` | `/CustomerCard/AddCustomerCard` | - | - | Bổ dung danh sách thẻ khách hàng | **DOCUMENTED** |
| `POST CustomerCard/LockCustomerCard` | `POST` | `/CustomerCard/LockCustomerCard` | - | - | Khóa danh sách thẻ khách hàng | **DOCUMENTED** |
| `POST CustomerCard/ActivateCustomerCard` | `POST` | `/CustomerCard/ActivateCustomerCard` | - | - | Kích hoạt thẻ khách hàng | **DOCUMENTED** |
| `POST CustomerCard/GetCustomerPointDetailLst` | `POST` | `/CustomerCard/GetCustomerPointDetailLst` | - | - | Kích hoạt thẻ khách hàng | **DOCUMENTED** |
| `POST ConnectFast/GetDataProductImport` | `POST` | `/ConnectFast/GetDataProductImport` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetDataLotImport` | `POST` | `/ConnectFast/GetDataLotImport` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetDataProductSales` | `POST` | `/ConnectFast/GetDataProductSales` | - | - | Lấy thông tin đơn hàng theo mẫu Fast | **DOCUMENTED** |
| `POST ConnectFast/GetDataProductOrder` | `POST` | `/ConnectFast/GetDataProductOrder` | - | - | Lấy thông tin đơn đặt theo mẫu Fast | **DOCUMENTED** |
| `POST ConnectFast/GetProductPackageFast` | `POST` | `/ConnectFast/GetProductPackageFast` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetDataProductTransfer` | `POST` | `/ConnectFast/GetDataProductTransfer` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetDataProductTransferCenter` | `POST` | `/ConnectFast/GetDataProductTransferCenter` | - | - | Chuyển kho trung tâm | **DOCUMENTED** |
| `POST ConnectFast/GetDataProductReturn` | `POST` | `/ConnectFast/GetDataProductReturn` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetDataSuppliesImport` | `POST` | `/ConnectFast/GetDataSuppliesImport` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetInventoryByShop` | `POST` | `/ConnectFast/GetInventoryByShop` | - | - | - | **DOCUMENTED** |
| `POST ConnectFast/GetInventoryByCenter` | `POST` | `/ConnectFast/GetInventoryByCenter` | - | - | Lấy thông tin tồn kho theo cách tính Fast | **DOCUMENTED** |
| `POST ConnectFast/GetSalesHeader` | `POST` | `/ConnectFast/GetSalesHeader` | - | - | Lấy danh sách đơn hàng đẩy lên Fast | **DOCUMENTED** |
| `POST ConnectFast/GetCustomerSales` | `POST` | `/ConnectFast/GetCustomerSales` | - | - | Lấy danh sách khách hàng bán trên Fast | **DOCUMENTED** |
| `POST ConnectFast/GetProductSaleByDocs` | `POST` | `/ConnectFast/GetProductSaleByDocs` | - | - | Lấy chi tiết đơn hàng bán trên Fast | **DOCUMENTED** |
| `POST ConnectFast/GetProductSaleByDMSID` | `POST` | `/ConnectFast/GetProductSaleByDMSID` | - | - | Lấy chi tiết đơn hàng bán trên Fast theo DMSID | **DOCUMENTED** |
| `POST ConnectFast/UpSalesInvoice` | `POST` | `/ConnectFast/UpSalesInvoice` | - | - | Lấy chi tiết đơn hàng bán trên Fast | **OBSERVED** |
| `POST ConnectFast/DelUpSalesInvoice` | `POST` | `/ConnectFast/DelUpSalesInvoice` | - | - | Xóa thông tin đẩy đơn hàng bán trên Fast | **OBSERVED** |
| `POST ConnectFast/GetImportStore` | `POST` | `/ConnectFast/GetImportStore` | - | - | Lấy thông tin các phiếu điều chuyển | **DOCUMENTED** |
| `POST ConnectFast/GetProductTransferByID` | `POST` | `/ConnectFast/GetProductTransferByID` | - | - | Lấy thông tin chi tiết các phiếu điều chuyển theo Model Fast | **DOCUMENTED** |
| `POST ConnectFast/UpImportStore` | `POST` | `/ConnectFast/UpImportStore` | - | - | Đẩy thông tin phiếu  điều lên Fast | **DOCUMENTED** |
| `POST ConnectFast/DelUpImportStore` | `POST` | `/ConnectFast/DelUpImportStore` | - | - | Xóa thông tin phiếu  điều lên Fast | **DOCUMENTED** |
| `POST ConnectFast/GetHisUpInvoiceDoc` | `POST` | `/ConnectFast/GetHisUpInvoiceDoc` | - | - | lấy thông tin phiếu  điều lên Fast | **DOCUMENTED** |
| `POST ConnectFast/GetHisUpInvoiceLine` | `POST` | `/ConnectFast/GetHisUpInvoiceLine` | - | - | lấy thông tin line phiếu  điều lên Fast | **DOCUMENTED** |
| `POST ConnectFast/GetImportSystem` | `POST` | `/ConnectFast/GetImportSystem` | - | - | lấy thông tin danh sách đơn nhập kho hệ thống | **DOCUMENTED** |
| `POST ConnectFast/GetProductImportByID` | `POST` | `/ConnectFast/GetProductImportByID` | - | - | lấy thông tin dòng hàng đơn nhập kho hệ thống | **DOCUMENTED** |
| `POST ConnectFast/UpImportSystem` | `POST` | `/ConnectFast/UpImportSystem` | - | - | Đẩy đơn nhập kho lên hệ thống | **DOCUMENTED** |
| `POST ConnectFast/DelUpImportSystem` | `POST` | `/ConnectFast/DelUpImportSystem` | - | - | Xóa đơn đẩy nhập kho lên hệ thống | **DOCUMENTED** |
| `POST ConnectFast/GetHistoryUpImportDoc` | `POST` | `/ConnectFast/GetHistoryUpImportDoc` | - | - | Lấy danh sách hủy đơn nhập tồn | **DOCUMENTED** |
| `POST TransferOrder/CreateTransferOrder` | `POST` | `/TransferOrder/CreateTransferOrder` | - | - | Tạo mới đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrder/CreateTransferOrderLst` | `POST` | `/TransferOrder/CreateTransferOrderLst` | - | - | - | **DOCUMENTED** |
| `POST TransferOrder/UpdateTransferOrder` | `POST` | `/TransferOrder/UpdateTransferOrder` | - | - | Cập nhật đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrder/DelTransferOrder` | `POST` | `/TransferOrder/DelTransferOrder` | - | - | Hủy đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrder/UpdateTransferOrderLot` | `POST` | `/TransferOrder/UpdateTransferOrderLot` | - | - | Cập nhật ds lô đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrder/UpdateTransferOrderLotV2` | `POST` | `/TransferOrder/UpdateTransferOrderLotV2` | - | - | Cập nhật ds lô đặt hàng nội bộ V2 | **DOCUMENTED** |
| `POST TransferOrder/StopTransferOrderLot` | `POST` | `/TransferOrder/StopTransferOrderLot` | - | - | Cập nhật ds lô đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrder/NoteTransferOrderLot` | `POST` | `/TransferOrder/NoteTransferOrderLot` | - | - | Ghi chú mua hàng | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderLot` | `POST` | `/TransferOrder/GetTransferOrderLot` | - | - | Lấy thông tin lô đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderLotV2` | `POST` | `/TransferOrder/GetTransferOrderLotV2` | - | - | Lấy thông tin lô đặt hàng nội bộ V2 | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderByTime` | `POST` | `/TransferOrder/GetTransferOrderByTime` | - | - | Lấy danh sách đơn nội bộ theo thời gian | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderHeaderInfo` | `POST` | `/TransferOrder/GetTransferOrderHeaderInfo` | - | - | Lấy danh sách đơn nội bộ theo thời gian | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderSysByTime` | `POST` | `/TransferOrder/GetTransferOrderSysByTime` | - | - | Lấy danh sách đơn nội bộ theo thời gian | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderSysByTime2` | `POST` | `/TransferOrder/GetTransferOrderSysByTime2` | - | - | Lấy danh sách đơn nội bộ theo thời gian | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderedQuaByDoc` | `POST` | `/TransferOrder/GetTransferOrderedQuaByDoc` | - | - | Lấy danh sách đã bốc lô sản phẩm | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderProcess` | `POST` | `/TransferOrder/GetTransferOrderProcess` | - | - | Lấy danh sách sản phẩm đã gọi hàng trước đó của Shop | **DOCUMENTED** |
| `POST TransferOrder/ApproveTransferOrderHeader` | `POST` | `/TransferOrder/ApproveTransferOrderHeader` | - | - | - | **DOCUMENTED** |
| `POST TransferOrder/GetPlanTransferOrderLst` | `POST` | `/TransferOrder/GetPlanTransferOrderLst` | - | - | Lấy báo cáo kế hoạch bốc lô đơn gọi hàng | **DOCUMENTED** |
| `POST TransferOrder/GetItemOrderByShop` | `POST` | `/TransferOrder/GetItemOrderByShop` | - | - | Lấy báo cáo kế hoạch bốc lô đơn gọi hàng | **DOCUMENTED** |
| `POST TransferOrder/GetItemOrderByShopV2` | `POST` | `/TransferOrder/GetItemOrderByShopV2` | - | - | Lấy báo cáo kế hoạch bốc lô đơn gọi hàng | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderByFollower` | `POST` | `/TransferOrder/GetTransferOrderByFollower` | - | - | Báo cáo người follow hàng hóa gọi hàng | **DOCUMENTED** |
| `POST TransferOrder/GetTransferOrderByFollowerD` | `POST` | `/TransferOrder/GetTransferOrderByFollowerD` | - | - | Báo cáo người follow hàng hóa gọi hàng | **DOCUMENTED** |
| `POST TransferOrder/GetSuggestTransferOrderLst` | `POST` | `/TransferOrder/GetSuggestTransferOrderLst` | - | - | Lấy thông tin gợi ý bốc hàng | **DOCUMENTED** |
| `POST TransferOrder/GetDeliverySpeedLst` | `POST` | `/TransferOrder/GetDeliverySpeedLst` | - | - | Lấy báo cáo tốc độ xử lý hàng hóa | **DOCUMENTED** |
| `POST PackageDefault/GetPackageDefaultLst` | `POST` | `/PackageDefault/GetPackageDefaultLst` | - | - | Lấy danh sách quy cách | **DOCUMENTED** |
| `POST PackageDefault/UpdatePackageDefault` | `POST` | `/PackageDefault/UpdatePackageDefault` | - | - | Cập nhật quy cách mặc định | **DOCUMENTED** |
| `POST PackageDefault/DelPackageDefault` | `POST` | `/PackageDefault/DelPackageDefault` | - | - | Cập nhật quy cách mặc định | **DOCUMENTED** |
| `POST MHImportSystem/CreateImportSystem` | `POST` | `/MHImportSystem/CreateImportSystem` | - | - | Tạo phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHImportSystem/UpdateImportSystem` | `POST` | `/MHImportSystem/UpdateImportSystem` | - | - | Cập nhật phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHImportSystem/ApproveImportSystem` | `POST` | `/MHImportSystem/ApproveImportSystem` | - | - | Phê duyệt phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHImportSystem/DelImportSystem` | `POST` | `/MHImportSystem/DelImportSystem` | - | - | Hủy phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHImportSystem/GetImportSystemLst` | `POST` | `/MHImportSystem/GetImportSystemLst` | - | - | Lấy danh sách phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHImportSystem/GetImportSystemLstByShop` | `POST` | `/MHImportSystem/GetImportSystemLstByShop` | - | - | - | **DOCUMENTED** |
| `POST MHImportSystem/GetImportSystemByID` | `POST` | `/MHImportSystem/GetImportSystemByID` | - | - | Lấy thông tin chi tiết phiếu mua hàng | **DOCUMENTED** |
| `POST MHImportSystem/GetReportImportSystem` | `POST` | `/MHImportSystem/GetReportImportSystem` | - | - | Lấy thông tin báo cáo phiếu nhập hàng | **DOCUMENTED** |
| `POST MHImportSystem/GetImportSysDetail` | `POST` | `/MHImportSystem/GetImportSysDetail` | - | - | Lấy thông tin phiếu nhập hàng để tạo THT | **DOCUMENTED** |
| `POST MHImportSystem/GetFileImportSys` | `POST` | `/MHImportSystem/GetFileImportSys` | - | - | Lấy thông tin danh sách file mua hàng | **DOCUMENTED** |
| `POST MHOrder/CreateOrderHeader` | `POST` | `/MHOrder/CreateOrderHeader` | - | - | Tạo phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/UpdateOrderHeader` | `POST` | `/MHOrder/UpdateOrderHeader` | - | - | Cập nhật phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/DelOrderHeader` | `POST` | `/MHOrder/DelOrderHeader` | - | - | Xóa phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/ApproveOrderHeader` | `POST` | `/MHOrder/ApproveOrderHeader` | - | - | Phê duyệt phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/GetOrderHeaderByTime` | `POST` | `/MHOrder/GetOrderHeaderByTime` | - | - | Lấy danh sách phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/GetOrderHeaderByID` | `POST` | `/MHOrder/GetOrderHeaderByID` | - | - | Lấy chi tiết phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/GetOrderSuggestLst` | `POST` | `/MHOrder/GetOrderSuggestLst` | - | - | Lấy gợi ý phiếu đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrder/GetOrderSuggestLstV2` | `POST` | `/MHOrder/GetOrderSuggestLstV2` | - | - | Lấy gợi ý phiếu đề xuất mua hàng V2 | **DOCUMENTED** |
| `POST MHOrder/GetSuggestLst` | `POST` | `/MHOrder/GetSuggestLst` | - | - | Lấy đề xuất mua hàng lựa chọn | **DOCUMENTED** |
| `POST MHOrder/CreateSuggestLst` | `POST` | `/MHOrder/CreateSuggestLst` | - | - | Tạo đề xuất mua hàng lựa chọn | **DOCUMENTED** |
| `POST MHOrder/DelSuggestLst` | `POST` | `/MHOrder/DelSuggestLst` | - | - | Xóa đề xuất mua hàng lựa chọn | **DOCUMENTED** |
| `POST MHOrder/ApproveSuggestLst` | `POST` | `/MHOrder/ApproveSuggestLst` | - | - | Phê duyệt đề xuất mua hàng lựa chọn | **DOCUMENTED** |
| `POST MHOrder/GetReportOrderByTime` | `POST` | `/MHOrder/GetReportOrderByTime` | - | - | Phê duyệt đề xuất mua hàng lựa chọn | **DOCUMENTED** |
| `POST MHOrder/GetReportOrderByShop` | `POST` | `/MHOrder/GetReportOrderByShop` | - | - | - | **DOCUMENTED** |
| `POST MHOrder/ApproveOrderLine` | `POST` | `/MHOrder/ApproveOrderLine` | - | - | Phê duyệt dòng line DXM | **DOCUMENTED** |
| `POST MHOrder/SplitInvoiceOrder` | `POST` | `/MHOrder/SplitInvoiceOrder` | - | - | Tách đơn | **DOCUMENTED** |
| `POST ImportSupplies/CreateImportSupp` | `POST` | `/ImportSupplies/CreateImportSupp` | - | - | Tạo đơn nhập vật tư | **DOCUMENTED** |
| `POST ImportSupplies/UpdateImportSupp` | `POST` | `/ImportSupplies/UpdateImportSupp` | - | - | Cập nhật phiếu nhập vật tư | **DOCUMENTED** |
| `POST ImportSupplies/DelImportSupp` | `POST` | `/ImportSupplies/DelImportSupp` | - | - | - | **DOCUMENTED** |
| `POST ImportSupplies/ApproveImportSupp` | `POST` | `/ImportSupplies/ApproveImportSupp` | - | - | Cập nhật phiếu nhập vật tư | **DOCUMENTED** |
| `POST ImportSupplies/GetImportSuppHeaderLst` | `POST` | `/ImportSupplies/GetImportSuppHeaderLst` | - | - | danh sách phiếu nhập vật tư | **DOCUMENTED** |
| `POST ImportSupplies/GetImportSuppHeaderByID` | `POST` | `/ImportSupplies/GetImportSuppHeaderByID` | - | - | danh sách phiếu nhập vật tư | **DOCUMENTED** |
| `POST TransferOrderShopNew/GetTransferOrderFirstLst` | `POST` | `/TransferOrderShopNew/GetTransferOrderFirstLst` | - | - | Lấy danh mục sản phẩm Order cho nhà mới | **DOCUMENTED** |
| `POST TransferOrderShopNew/CreateTransferOrderFirstLst` | `POST` | `/TransferOrderShopNew/CreateTransferOrderFirstLst` | - | - | Tạo lại danh mục sản phẩm Order cho nhà mới | **DOCUMENTED** |
| `POST TransferOrderShopNew/UpdateTransferOrderFirst` | `POST` | `/TransferOrderShopNew/UpdateTransferOrderFirst` | - | - | Cập nhật lại số lượng trong danh mục sản phẩm Order | **DOCUMENTED** |
| `POST TransferOrderShopNew/ApproveTransferOrderFirst` | `POST` | `/TransferOrderShopNew/ApproveTransferOrderFirst` | - | - | Xác nhận danh mục sản phẩm Order | **DOCUMENTED** |
| `POST KKInventory/CreateInventoryByStore` | `POST` | `/KKInventory/CreateInventoryByStore` | - | - | Tạo mới phiếu kiểm kê | **DOCUMENTED** |
| `POST KKInventory/CreateInventoryLineByStore` | `POST` | `/KKInventory/CreateInventoryLineByStore` | - | - | Cập nhật phiếu kiểm kê | **DOCUMENTED** |
| `POST KKInventory/ApproveInventoryByStore` | `POST` | `/KKInventory/ApproveInventoryByStore` | - | - | Duyệt phiếu kiểm kê | **DOCUMENTED** |
| `POST ProductUnitPrint/GetProductUnitPrintByPID` | `POST` | `/ProductUnitPrint/GetProductUnitPrintByPID` | - | - | - | **DOCUMENTED** |
| `POST ProductUnitPrint/UpdateProductUnitPrint` | `POST` | `/ProductUnitPrint/UpdateProductUnitPrint` | - | - | - | **DOCUMENTED** |
| `POST Promotion/CreatePromoHeader` | `POST` | `/Promotion/CreatePromoHeader` | - | - | - | **DOCUMENTED** |
| `POST Promotion/UpdatePromoHeader` | `POST` | `/Promotion/UpdatePromoHeader` | - | - | - | **DOCUMENTED** |
| `POST Promotion/DelPromoHeader` | `POST` | `/Promotion/DelPromoHeader` | - | - | - | **DOCUMENTED** |
| `POST Promotion/GetPromoHeaderLst` | `POST` | `/Promotion/GetPromoHeaderLst` | - | - | Lấy dánh sách khuyến mại toàn hệ thống | **DOCUMENTED** |
| `POST Promotion/GetPromoHeaderLstByShop` | `POST` | `/Promotion/GetPromoHeaderLstByShop` | - | - | Lấy dánh sách khuyến mại theo Shop | **DOCUMENTED** |
| `POST Promotion/GetPromoHeaderByID` | `POST` | `/Promotion/GetPromoHeaderByID` | - | - | Lấy CT khuyến mại theo ID | **DOCUMENTED** |
| `POST Promotion/UpdatePromoShop` | `POST` | `/Promotion/UpdatePromoShop` | - | - | Cập nhật chính sách KM theo Shop | **DOCUMENTED** |
| `POST Promotion/GetPromoShopLst` | `POST` | `/Promotion/GetPromoShopLst` | - | - | Lấy các shop có ct khuyến mại | **DOCUMENTED** |
| `POST CRM/UpdateBuyerDiagnose` | `POST` | `/CRM/UpdateBuyerDiagnose` | - | - | Cập nhật thông tin khách hàng chăm sóc | **DOCUMENTED** |
| `POST File/UploadImageCRM?Token={Token}&uPharmaID={uPharmaID}&RowID={RowID}` | `POST` | `/File/UploadImageCRM?Token={Token}&uPharmaID={uPharmaID}&RowID={RowID}` | - | - | Upload ảnh chăm sóc khách hàng | **DOCUMENTED** |
| `GET File/DownloadImageCRM?uPharmaID={uPharmaID}&Token={Token}&RowID={RowID}` | `GET` | `/File/DownloadImageCRM?uPharmaID={uPharmaID}&Token={Token}&RowID={RowID}` | - | - | Hàm lấy ảnh của chăm sóc khách hàng | **DOCUMENTED** |
| `POST LGTShip/UpdateFeeShip` | `POST` | `/LGTShip/UpdateFeeShip` | - | - | API cập nhật thông tin phí Ship | **DOCUMENTED** |
| `POST LGTShip/GetShipPartnerLst` | `POST` | `/LGTShip/GetShipPartnerLst` | - | - | API cập nhật thông tin phí Ship | **DOCUMENTED** |
| `POST LGTShip/CreateShipPartner` | `POST` | `/LGTShip/CreateShipPartner` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/UpdateShipPartner` | `POST` | `/LGTShip/UpdateShipPartner` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/DelShipPartner` | `POST` | `/LGTShip/DelShipPartner` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/GetTransferDocLst` | `POST` | `/LGTShip/GetTransferDocLst` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/CreateBox` | `POST` | `/LGTShip/CreateBox` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/UpdateBox` | `POST` | `/LGTShip/UpdateBox` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/DelBox` | `POST` | `/LGTShip/DelBox` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/ComfirmBox` | `POST` | `/LGTShip/ComfirmBox` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/GetBoxByID` | `POST` | `/LGTShip/GetBoxByID` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/GetBoxByTime` | `POST` | `/LGTShip/GetBoxByTime` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/GetPartnerShopLst` | `POST` | `/LGTShip/GetPartnerShopLst` | - | - | No documentation available. | **DOCUMENTED** |
| `POST LGTShip/UpdatePartnerShop` | `POST` | `/LGTShip/UpdatePartnerShop` | - | - | No documentation available. | **DOCUMENTED** |
| `POST FileSupplier/UploadFileSupplier?FileName={FileName}&FileType={FileType}&uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&ExpirationDate={ExpirationDate}&Note={Note}` | `POST` | `/FileSupplier/UploadFileSupplier?FileName={FileName}&FileType={FileType}&uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&ExpirationDate={ExpirationDate}&Note={Note}` | - | - | - | **DOCUMENTED** |
| `POST FileSupplier/UploadFileAuthorize?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&FileID={FileID}` | `POST` | `/FileSupplier/UploadFileAuthorize?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&FileID={FileID}` | - | - | - | **DOCUMENTED** |
| `POST FileSupplier/UploadSupplierProductFile?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&ProductID={ProductID}&FileType={FileType}&TimeApply={TimeApply}&ExpirationDate={ExpirationDate}&FileCode={FileCode}` | `POST` | `/FileSupplier/UploadSupplierProductFile?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&ProductID={ProductID}&FileType={FileType}&TimeApply={TimeApply}&ExpirationDate={ExpirationDate}&FileCode={FileCode}` | - | - | No documentation available. | **DOCUMENTED** |
| `GET FileSupplier/DownloadSupplierProductFile?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&ProductID={ProductID}&FileID={FileID}` | `GET` | `/FileSupplier/DownloadSupplierProductFile?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&ProductID={ProductID}&FileID={FileID}` | - | - | - | **DOCUMENTED** |
| `GET FileSupplier/DownloadFileAuthorize?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&FileID={FileID}` | `GET` | `/FileSupplier/DownloadFileAuthorize?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&FileID={FileID}` | - | - | - | **DOCUMENTED** |
| `GET FileSupplier/DownloadFileSupplier?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&FileID={FileID}` | `GET` | `/FileSupplier/DownloadFileSupplier?uPharmaID={uPharmaID}&Token={Token}&CustomerID={CustomerID}&FileID={FileID}` | - | - | - | **DOCUMENTED** |
| `GET FileSupplier/DelFileSupplier?uPharmaID={uPharmaID}&Token={Token}&FileID={FileID}` | `GET` | `/FileSupplier/DelFileSupplier?uPharmaID={uPharmaID}&Token={Token}&FileID={FileID}` | - | - | - | **DOCUMENTED** |
| `POST SYTImportStore/CreateImportStoreDoc` | `POST` | `/SYTImportStore/CreateImportStoreDoc` | - | - | Tạo phiếu nhập tồn | **DOCUMENTED** |
| `POST SYTImportStore/UpdateImportStoreDoc` | `POST` | `/SYTImportStore/UpdateImportStoreDoc` | - | - | Cập nhật phiếu nhập tồn | **DOCUMENTED** |
| `POST SYTImportStore/DelImportStoreDoc` | `POST` | `/SYTImportStore/DelImportStoreDoc` | - | - | Xóa phiếu nhập tồn | **DOCUMENTED** |
| `POST SYTImportStore/GetImportStoreDocByID` | `POST` | `/SYTImportStore/GetImportStoreDocByID` | - | - | Lấy chi tiết phiếu nhập tồn | **DOCUMENTED** |
| `POST SYTImportStore/GetImportStoreDocByTime` | `POST` | `/SYTImportStore/GetImportStoreDocByTime` | - | - | Lấy danh sách phiếu nhập tồn theo thời gian | **DOCUMENTED** |
| `POST SYTImportStore/UploadImportStoreDoc` | `POST` | `/SYTImportStore/UploadImportStoreDoc` | - | - | Lấy danh sách phiếu nhập tồn theo thời gian | **DOCUMENTED** |
| `POST SYTImportStore/DisconnectImportStoreDoc` | `POST` | `/SYTImportStore/DisconnectImportStoreDoc` | - | - | - | **DOCUMENTED** |
| `POST SYTImportStore/GetInventoryByShop` | `POST` | `/SYTImportStore/GetInventoryByShop` | - | - | Lấy tồn kho kết nối Sở y tế | **DOCUMENTED** |
| `POST SYTImportStore/GetSalesLineByTime` | `POST` | `/SYTImportStore/GetSalesLineByTime` | - | - | Lấy danh sách thông tin đơn bán đã kết nối lên sở y tế | **DOCUMENTED** |
| `POST KKReceipt/CreateReceiptHeader` | `POST` | `/KKReceipt/CreateReceiptHeader` | - | - | Tạo mới phiếu thu tiền | **DOCUMENTED** |
| `POST KKReceipt/UpdateReceiptHeader` | `POST` | `/KKReceipt/UpdateReceiptHeader` | - | - | Tạo mới phiếu thu tiền | **DOCUMENTED** |
| `POST KKReceipt/DelReceiptHeader` | `POST` | `/KKReceipt/DelReceiptHeader` | - | - | Xóa phiếu thu tiền | **DOCUMENTED** |
| `POST KKReceipt/ApproveReceiptHeader` | `POST` | `/KKReceipt/ApproveReceiptHeader` | - | - | Phê duyệt phiếu thu tiền | **DOCUMENTED** |
| `POST KKReceipt/GetReceiptHeaderLst` | `POST` | `/KKReceipt/GetReceiptHeaderLst` | - | - | Phê duyệt phiếu thu tiền | **DOCUMENTED** |
| `POST KKReceipt/GetReceiptHeaderByID` | `POST` | `/KKReceipt/GetReceiptHeaderByID` | - | - | Phê duyệt phiếu thu tiền | **DOCUMENTED** |
| `POST KKReceipt/GetEmployeeForReceipt` | `POST` | `/KKReceipt/GetEmployeeForReceipt` | - | - | Lấy danh sách Kế toán nhận tiền | **DOCUMENTED** |
| `POST KKReceipt/GetBankStatementByTime` | `POST` | `/KKReceipt/GetBankStatementByTime` | - | - | Lấy danh sách sao kê | **DOCUMENTED** |
| `POST MHPayment/CreatePaymentHeader` | `POST` | `/MHPayment/CreatePaymentHeader` | - | - | Tạo phiếu đề xuất thanh toán | **DOCUMENTED** |
| `POST MHPayment/UpdatePaymentHeader` | `POST` | `/MHPayment/UpdatePaymentHeader` | - | - | Cập nhật phiếu đề xuất thanh toán | **DOCUMENTED** |
| `POST MHPayment/DelPaymentHeader` | `POST` | `/MHPayment/DelPaymentHeader` | - | - | Xóa phiếu đề xuất thanh toán | **DOCUMENTED** |
| `POST MHPayment/ApprovePaymentHeader` | `POST` | `/MHPayment/ApprovePaymentHeader` | - | - | Phê duyệt phiếu đề xuất thanh toán | **DOCUMENTED** |
| `POST MHPayment/GetPaymentHeaderLst` | `POST` | `/MHPayment/GetPaymentHeaderLst` | - | - | Lấy danh sách phiếu đề xuất thanh toán | **DOCUMENTED** |
| `POST MHPayment/GetPaymentHeaderByID` | `POST` | `/MHPayment/GetPaymentHeaderByID` | - | - | Lấy phiếu đề xuất thanh toán theo ID | **DOCUMENTED** |
| `POST MHPayment/GetDebtByTime` | `POST` | `/MHPayment/GetDebtByTime` | - | - | Lấy thông tin phiếu công nợ | **DOCUMENTED** |
| `POST ProductOff/GetProductOff` | `POST` | `/ProductOff/GetProductOff` | - | - | Lấy danh sách sản phẩm dừng hết | **DOCUMENTED** |
| `POST ProductOff/UpProductOff` | `POST` | `/ProductOff/UpProductOff` | - | - | Cập nhật thông tin sản phẩm | **DOCUMENTED** |
| `POST ProductOff/DelProductOff` | `POST` | `/ProductOff/DelProductOff` | - | - | Xóa sản phẩm khỏi danh sách | **DOCUMENTED** |
| `POST ProductOff/GetProductOffShop` | `POST` | `/ProductOff/GetProductOffShop` | - | - | - | **DOCUMENTED** |
| `POST ProductOff/UpdateProductOffShop` | `POST` | `/ProductOff/UpdateProductOffShop` | - | - | - | **DOCUMENTED** |
| `POST ProductClass/AddProductClass` | `POST` | `/ProductClass/AddProductClass` | - | - | Tạo nhóm sản phẩm | **DOCUMENTED** |
| `POST ProductClass/DelProductClass` | `POST` | `/ProductClass/DelProductClass` | - | - | Xóa nhóm sản phẩm | **DOCUMENTED** |
| `POST ProductClass/GetProductClassLst` | `POST` | `/ProductClass/GetProductClassLst` | - | - | Lấy danh sách nhóm sản phẩm | **DOCUMENTED** |
| `POST ProductGroup/GetUserProductGroup` | `POST` | `/ProductGroup/GetUserProductGroup` | - | - | Lấy thông tin phân chia nhóm sản phẩm | **OBSERVED** |
| `POST ProductGroup/AddUserProductGroup` | `POST` | `/ProductGroup/AddUserProductGroup` | - | - | Lấy thông tin phân chia nhóm sản phẩm | **OBSERVED** |
| `POST KTProductSpecial/GetProductSpecialLst` | `POST` | `/KTProductSpecial/GetProductSpecialLst` | - | - | Lấy danh sách sản phẩm điều chuyển đặc biệt | **DOCUMENTED** |
| `POST KTProductSpecial/AddProductSpecial` | `POST` | `/KTProductSpecial/AddProductSpecial` | - | - | Tạo mới sản phẩm điều chuyển đặc biệt | **DOCUMENTED** |
| `POST KTProductSpecial/DelProductSpecial` | `POST` | `/KTProductSpecial/DelProductSpecial` | - | - | Xóa sản phẩm điều chuyển đặc biệt | **DOCUMENTED** |
| `POST Report/GetExistProductLst` | `POST` | `/Report/GetExistProductLst` | - | - | Lấy tồn kho hệ thống theo sản phẩm theo sản phẩm | **DOCUMENTED** |
| `POST Report/GetExistProductByShop` | `POST` | `/Report/GetExistProductByShop` | - | - | Lấy tồn kho hệ thống theo sản phẩm theo shop | **DOCUMENTED** |
| `POST Report/GetRewardNearExpirationLst` | `POST` | `/Report/GetRewardNearExpirationLst` | - | - | Danh sách điểm thưởng bán hàng | **DOCUMENTED** |
| `POST Report/GetSuggestPlanToBuyLst` | `POST` | `/Report/GetSuggestPlanToBuyLst` | - | - | Danh sách điểm thưởng bán hàng | **DOCUMENTED** |
| `POST Report/GetReportGeneralByType` | `POST` | `/Report/GetReportGeneralByType` | - | - | Danh sách báo cáo | **DOCUMENTED** |
| `POST Report/GetImportNearExpiration` | `POST` | `/Report/GetImportNearExpiration` | - | - | Danh sách báo cáo nhập hàng cận date trong tháng | **DOCUMENTED** |
| `POST TransferSupplies/ApproveTransferSuppLine` | `POST` | `/TransferSupplies/ApproveTransferSuppLine` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/GetTransferSuppByHId` | `POST` | `/TransferSupplies/GetTransferSuppByHId` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/GetTransferSupp` | `POST` | `/TransferSupplies/GetTransferSupp` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/CreateTransferSupp` | `POST` | `/TransferSupplies/CreateTransferSupp` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/UpdateTransferSupp` | `POST` | `/TransferSupplies/UpdateTransferSupp` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/DelTransferSupp` | `POST` | `/TransferSupplies/DelTransferSupp` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/ApproveTransferSupp` | `POST` | `/TransferSupplies/ApproveTransferSupp` | - | - | - | **DOCUMENTED** |
| `POST TransferSupplies/GetInventorySupplies` | `POST` | `/TransferSupplies/GetInventorySupplies` | - | - | Lấy tồn kho vật tư | **DOCUMENTED** |
| `POST TransferSupplies/GetLocalSuppStoreLst` | `POST` | `/TransferSupplies/GetLocalSuppStoreLst` | - | - | Lấy tồn kho vật tư | **DOCUMENTED** |
| `POST TransferSupplies/GetInventorySuppByStoreID` | `POST` | `/TransferSupplies/GetInventorySuppByStoreID` | - | - | Lấy tồn kho vật tư | **DOCUMENTED** |
| `POST TransferSupplies/GetSuppUserLstByTime` | `POST` | `/TransferSupplies/GetSuppUserLstByTime` | - | - | Lấy sử dụng tồn kho | **OBSERVED** |
| `POST TransferSupplies/GetSpeedSupplies` | `POST` | `/TransferSupplies/GetSpeedSupplies` | - | - | Lấy tốc độ tiêu thụ vật tư | **DOCUMENTED** |
| `POST VNPay/VNPayIPN` | `POST` | `/VNPay/VNPayIPN` | - | - | Tạo mới chính sách | **DOCUMENTED** |
| `POST VNPay/CreateQRPayment` | `POST` | `/VNPay/CreateQRPayment` | - | - | Tạo mới chính sách | **DOCUMENTED** |
| `POST VNPay/CreateQRPayment2` | `POST` | `/VNPay/CreateQRPayment2` | - | - | Tạo mới chính sách | **DOCUMENTED** |
| `POST VNPay/CreateCardPayment` | `POST` | `/VNPay/CreateCardPayment` | - | - | Tạo với yêu cầu thanh toán bằng quẹt thẻ | **DOCUMENTED** |
| `POST VNPay/CheckCompleteQRPayment` | `POST` | `/VNPay/CheckCompleteQRPayment` | - | - | Kiểm tra tình trạng thanh toán VNpay | **DOCUMENTED** |
| `POST VNPay/GetQRPaymentLst` | `POST` | `/VNPay/GetQRPaymentLst` | - | - | Lấy danh sách thanh toán VNPay theo nhà thuốc | **DOCUMENTED** |
| `POST VNPay/GetQRTransactionCode` | `POST` | `/VNPay/GetQRTransactionCode` | - | - | Lấy ClientTransactionCode | **DOCUMENTED** |
| `POST SupplierProduct/GetProductOfSupplier` | `POST` | `/SupplierProduct/GetProductOfSupplier` | - | - | Lấy sản phẩm của nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/GetProductSupplierLst` | `POST` | `/SupplierProduct/GetProductSupplierLst` | - | - | Lấy sản phẩm của nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/AddProductSupplier` | `POST` | `/SupplierProduct/AddProductSupplier` | - | - | Thêm mới sản phẩm nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/DelProductSupplier` | `POST` | `/SupplierProduct/DelProductSupplier` | - | - | Xóa sản phẩm nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/UpdateProductSupplier` | `POST` | `/SupplierProduct/UpdateProductSupplier` | - | - | Cập nhật sản phẩm nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/GetSupplierProductFile` | `POST` | `/SupplierProduct/GetSupplierProductFile` | - | - | Xóa sản phẩm nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/DelSupplierProductFile` | `POST` | `/SupplierProduct/DelSupplierProductFile` | - | - | Xóa File sản phẩm nhà cung cấp | **DOCUMENTED** |
| `POST SupplierProduct/CreateSupplierPolicy` | `POST` | `/SupplierProduct/CreateSupplierPolicy` | - | - | Tao mới thông tin chính sách sản phẩm | **DOCUMENTED** |
| `POST SupplierProduct/DelSupplierPolicy` | `POST` | `/SupplierProduct/DelSupplierPolicy` | - | - | Xóa thông tin chính sách sản phẩm | **DOCUMENTED** |
| `POST SupplierProduct/GetSupplierPolicy` | `POST` | `/SupplierProduct/GetSupplierPolicy` | - | - | Lấy thông tin chính sách sản phẩm | **DOCUMENTED** |
| `POST SupplierProduct/CreateSupplierSurvey` | `POST` | `/SupplierProduct/CreateSupplierSurvey` | - | - | Tao mới thông tin khảo sát sản phẩm | **DOCUMENTED** |
| `POST SupplierProduct/DelSupplierSurvey` | `POST` | `/SupplierProduct/DelSupplierSurvey` | - | - | Xóa thông tin khảo sát sản phẩm | **DOCUMENTED** |
| `POST SupplierProduct/GetSupplierSurvey` | `POST` | `/SupplierProduct/GetSupplierSurvey` | - | - | Lấy thông tin khảo sát sản phẩm | **DOCUMENTED** |
| `POST LocalStore/GetLocalStoreLst` | `POST` | `/LocalStore/GetLocalStoreLst` | - | - | Lấy thông tin đơn hàng | **OBSERVED** |
| `POST LocalStore/GetInventoryByShopID` | `POST` | `/LocalStore/GetInventoryByShopID` | - | - | Lấy thông tin tồn kho | **OBSERVED** |
| `POST LocalStore/GetInventoryByPickLot` | `POST` | `/LocalStore/GetInventoryByPickLot` | - | - | Lấy thông tin tồn kho cho gọi hàng | **OBSERVED** |
| `POST LocalStore/GetInventorySystem` | `POST` | `/LocalStore/GetInventorySystem` | - | - | Lấy thông tin tồn kho nhiều trung tâm | **OBSERVED** |
| `POST LocalStore/GetInventoryShop` | `POST` | `/LocalStore/GetInventoryShop` | - | - | Lấy thông tin tồn kho nhiều Shop | **OBSERVED** |
| `POST LocalStore/GetInventoryExpiration` | `POST` | `/LocalStore/GetInventoryExpiration` | - | - | Lấy thông tin tồn kho các hàng cận date | **OBSERVED** |
| `POST LocalStore/GetInventoryExpirationForPromo` | `POST` | `/LocalStore/GetInventoryExpirationForPromo` | - | - | Lấy thông tin tồn kho các hàng cận date | **OBSERVED** |
| `POST LocalStore/GetLotCodeIndexExistByShop` | `POST` | `/LocalStore/GetLotCodeIndexExistByShop` | - | - | Lấy thông tin về tồn lô nhảy | **OBSERVED** |
| `POST LocalStore/GetLotCodeIndexExistByCenter` | `POST` | `/LocalStore/GetLotCodeIndexExistByCenter` | - | - | Lấy thông tin về tồn lô nhảy | **OBSERVED** |
| `POST LocalStore/GetLotCodeIndexExist` | `POST` | `/LocalStore/GetLotCodeIndexExist` | - | - | Lấy thông tin về tồn lô nhảy | **OBSERVED** |
| `POST LocalStore/GetStoreCardByProductID` | `POST` | `/LocalStore/GetStoreCardByProductID` | - | - | Lấy thông tin thẻ kho | **OBSERVED** |
| `POST LocalStore/GetProductUnTransferLst` | `POST` | `/LocalStore/GetProductUnTransferLst` | - | - | Lấy thông tin hàng chậm luân chuyển | **OBSERVED** |
| `POST ConnectFast/GetDataCancelProductByTime` | `POST` | `/ConnectFast/GetDataCancelProductByTime` | - | - | API lấy danh sách sản phẩm hủy | **DOCUMENTED** |
| `POST ConnectFast/GetDataReturnShopByTime` | `POST` | `/ConnectFast/GetDataReturnShopByTime` | - | - | API lấy danh sách sản phẩm trả lại | **DOCUMENTED** |
| `POST ConnectFast/CreateBankCredit` | `POST` | `/ConnectFast/CreateBankCredit` | - | - | API tạo phiếu báo có | **DOCUMENTED** |
| `POST ConnectFast/DelBankCredit` | `POST` | `/ConnectFast/DelBankCredit` | - | - | Hủy phiếu báo có | **DOCUMENTED** |
| `POST ConnectFast/CreateBankDebit` | `POST` | `/ConnectFast/CreateBankDebit` | - | - | API tạo phiếu báo nợ | **DOCUMENTED** |
| `POST ConnectFast/DelBankDebit` | `POST` | `/ConnectFast/DelBankDebit` | - | - | API Xóa phiếu báo nợ | **DOCUMENTED** |
| `POST ImportStore/CreateImportStoreShop` | `POST` | `/ImportStore/CreateImportStoreShop` | - | - | Tạo phiếu điều chuyển kho Shop - shop | **DOCUMENTED** |
| `POST ImportStore/GetImportStoreShop` | `POST` | `/ImportStore/GetImportStoreShop` | - | - | Lấy danh sách biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/GetImportStoreShopByHId` | `POST` | `/ImportStore/GetImportStoreShopByHId` | - | - | Lấy thông tin biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/UpdateImportStoreShop` | `POST` | `/ImportStore/UpdateImportStoreShop` | - | - | Cập nhật thông tin biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/DelImportStoreShop` | `POST` | `/ImportStore/DelImportStoreShop` | - | - | Xóa biên bản giao nhận | **DOCUMENTED** |
| `POST ImportStore/ApproveImportLineShop` | `POST` | `/ImportStore/ApproveImportLineShop` | - | - | Duyệt dòng hàng phiếu nhập kho | **DOCUMENTED** |
| `POST ImportStore/GetLotTransferShopLst` | `POST` | `/ImportStore/GetLotTransferShopLst` | - | - | Duyệt dòng hàng phiếu nhập kho | **DOCUMENTED** |
| `POST ImportStore/ApproveImportStoreShop` | `POST` | `/ImportStore/ApproveImportStoreShop` | - | - | Duyệt phiếu nhập kho | **DOCUMENTED** |
| `POST OverTime/CreateOverTime` | `POST` | `/OverTime/CreateOverTime` | - | - | Đăng ký làm thêm giờ | **DOCUMENTED** |
| `POST OverTime/DelOverTime` | `POST` | `/OverTime/DelOverTime` | - | - | Hủy làm thêm giờ | **DOCUMENTED** |
| `POST OverTime/ApproveOverTime` | `POST` | `/OverTime/ApproveOverTime` | - | - | Phê duyệt làm thêm giờ | **DOCUMENTED** |
| `POST OverTime/GetOverTimeByTime` | `POST` | `/OverTime/GetOverTimeByTime` | - | - | Lấy danh sách làm thêm giờ | **DOCUMENTED** |
| `POST CancelProduct/GetStatisticsShop` | `POST` | `/CancelProduct/GetStatisticsShop` | - | - | Lấy thông tin các phiếu hủy sản phẩm theo thời gian | **DOCUMENTED** |
| `POST ProductWarning/GetProductWarning` | `POST` | `/ProductWarning/GetProductWarning` | - | - | Lấy danh sách sản phẩm cảnh báo | **DOCUMENTED** |
| `POST ProductWarning/UpdateProductWarning` | `POST` | `/ProductWarning/UpdateProductWarning` | - | - | Cập nhật lại danh sách sản phẩm cảnh báo | **DOCUMENTED** |
| `POST Product/AddDefaultValue` | `POST` | `/Product/AddDefaultValue` | - | - | Thêm mới các giá trị default | **DOCUMENTED** |
| `POST Admin/GetReportImportProductLst` | `POST` | `/Admin/GetReportImportProductLst` | - | - | - | **DOCUMENTED** |
| `POST Admin/GetReportSalesLotIndexLst` | `POST` | `/Admin/GetReportSalesLotIndexLst` | - | - | - | **DOCUMENTED** |
| `POST Admin/GetFunctionRoleLst` | `POST` | `/Admin/GetFunctionRoleLst` | - | - | - | **DOCUMENTED** |
| `POST Admin/UpdateFunctionRoleLst` | `POST` | `/Admin/UpdateFunctionRoleLst` | - | - | - | **DOCUMENTED** |
| `POST Admin/GetFunctionRoleByUser` | `POST` | `/Admin/GetFunctionRoleByUser` | - | - | - | **OBSERVED** |
| `POST Admin/GetProductUnsoldLst` | `POST` | `/Admin/GetProductUnsoldLst` | - | - | - | **DOCUMENTED** |
| `POST Admin/UnlockInvoice` | `POST` | `/Admin/UnlockInvoice` | - | - | - | **DOCUMENTED** |
| `POST Admin/GetTotalPriceShopLst` | `POST` | `/Admin/GetTotalPriceShopLst` | - | - | - | **DOCUMENTED** |
| `POST Admin/TestReq` | `POST` | `/Admin/TestReq` | - | - | - | **DOCUMENTED** |
| `POST TOOLImportStore/CreateImportStore` | `POST` | `/TOOLImportStore/CreateImportStore` | - | - | Tạo phiếu điều chuyển CCDC | **DOCUMENTED** |
| `POST TOOLImportStore/UpdateImportStore` | `POST` | `/TOOLImportStore/UpdateImportStore` | - | - | Cập nhật phiếu điều chuyển CCDC | **DOCUMENTED** |
| `POST TOOLImportStore/DelImportStore` | `POST` | `/TOOLImportStore/DelImportStore` | - | - | Xóa phiếu điều chuyển CCDC | **DOCUMENTED** |
| `POST TOOLImportStore/ApproveImportStore` | `POST` | `/TOOLImportStore/ApproveImportStore` | - | - | Phê duyệt phiếu điều chuyển CCDC | **DOCUMENTED** |
| `POST TOOLImportStore/GetImportStoreLst` | `POST` | `/TOOLImportStore/GetImportStoreLst` | - | - | Lấy danh sách phiếu điều chuyển CCDC | **DOCUMENTED** |
| `POST TOOLImportStore/GetImportStoreByID` | `POST` | `/TOOLImportStore/GetImportStoreByID` | - | - | Lấy chi tiết phiếu điều chuyển CCDC | **DOCUMENTED** |
| `POST TransferOrderCenter/CreateTransferOrderCenter` | `POST` | `/TransferOrderCenter/CreateTransferOrderCenter` | - | - | Tạo mới đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrderCenter/UpdateTransferOrderCenter` | `POST` | `/TransferOrderCenter/UpdateTransferOrderCenter` | - | - | Cập nhật đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrderCenter/DelTransferOrderCenter` | `POST` | `/TransferOrderCenter/DelTransferOrderCenter` | - | - | Xóa đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrderCenter/GetTransferOrderCenterInfo` | `POST` | `/TransferOrderCenter/GetTransferOrderCenterInfo` | - | - | Lấy thông tin đơn đặt hàng nội bộ | **DOCUMENTED** |
| `POST TransferOrderCenter/GetTransferOrderCenterByTime` | `POST` | `/TransferOrderCenter/GetTransferOrderCenterByTime` | - | - | Lấy thông tin đơn đặt hàng nội bộ theo thời gian | **DOCUMENTED** |
| `POST TransferOrderCenter/GetTransferOrderCenterDetailByTime` | `POST` | `/TransferOrderCenter/GetTransferOrderCenterDetailByTime` | - | - | Lấy thông tin đơn đặt hàng nội bộ chi tiết theo thời gian | **DOCUMENTED** |
| `POST TransferOrderCenter/GetTransferOrderCenterDetailByID` | `POST` | `/TransferOrderCenter/GetTransferOrderCenterDetailByID` | - | - | Lấy thông tin đơn đặt hàng nội bộ chi tiết theo thời gian | **DOCUMENTED** |
| `POST KTChangeLot/GetChangeLotLst` | `POST` | `/KTChangeLot/GetChangeLotLst` | - | - | Lấy danh sách đổi lô | **DOCUMENTED** |
| `POST KTChangeLot/UpdateChangeLot` | `POST` | `/KTChangeLot/UpdateChangeLot` | - | - | Cập nhật đổi lô | **DOCUMENTED** |
| `POST KTChangeLot/DelChangeLot` | `POST` | `/KTChangeLot/DelChangeLot` | - | - | Xóa đổi lô | **DOCUMENTED** |
| `POST Warehouse/GetLevel2Shelf` | `POST` | `/Warehouse/GetLevel2Shelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/GetLevel1Shelf` | `POST` | `/Warehouse/GetLevel1Shelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/UpdateNoteShelf` | `POST` | `/Warehouse/UpdateNoteShelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/CreateLevel1Shelf` | `POST` | `/Warehouse/CreateLevel1Shelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/CreateLevel2Shelf` | `POST` | `/Warehouse/CreateLevel2Shelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/GetProductShelf` | `POST` | `/Warehouse/GetProductShelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/AddProductShelf` | `POST` | `/Warehouse/AddProductShelf` | - | - | - | **DOCUMENTED** |
| `POST Warehouse/DelProductShelf` | `POST` | `/Warehouse/DelProductShelf` | - | - | - | **DOCUMENTED** |
| `POST HandingOver/CreateHandingOver` | `POST` | `/HandingOver/CreateHandingOver` | - | - | Tạo mới phiếu bàn giao | **DOCUMENTED** |
| `POST HandingOver/UpdateHandingOver` | `POST` | `/HandingOver/UpdateHandingOver` | - | - | Cập nhật phiếu bàn giao | **DOCUMENTED** |
| `POST HandingOver/ApproveHandingOver` | `POST` | `/HandingOver/ApproveHandingOver` | - | - | Phê duyệt phiếu bàn giao | **DOCUMENTED** |
| `POST HandingOver/DelHandingOver` | `POST` | `/HandingOver/DelHandingOver` | - | - | Phê duyệt phiếu bàn giao | **DOCUMENTED** |
| `POST HandingOver/GetHandingOverLst` | `POST` | `/HandingOver/GetHandingOverLst` | - | - | lấy danh sách phiếu bàn giao | **DOCUMENTED** |
| `POST HandingOver/GetHandingOverByID` | `POST` | `/HandingOver/GetHandingOverByID` | - | - | Lấy phiếu bàn giao theo ID | **DOCUMENTED** |
| `POST HandingOver/GetHandingOverByReceipt` | `POST` | `/HandingOver/GetHandingOverByReceipt` | - | - | Lấy phiếu bàn giao theo ID | **DOCUMENTED** |
| `POST ChangeGenuine/GetLotForChangeGenuine` | `POST` | `/ChangeGenuine/GetLotForChangeGenuine` | - | - | Lấy tồn tem cho đổi nguồn gốc | **DOCUMENTED** |
| `POST ChangeGenuine/CreateChangeGenuineDoc` | `POST` | `/ChangeGenuine/CreateChangeGenuineDoc` | - | - | Tạo phiếu thay đổi nguồn gốc | **DOCUMENTED** |
| `POST ChangeGenuine/UpdateChangeGenuineDoc` | `POST` | `/ChangeGenuine/UpdateChangeGenuineDoc` | - | - | Cập nhật phiếu thay đổi nguồn gốc | **DOCUMENTED** |
| `POST ChangeGenuine/DelChangeGenuineDoc` | `POST` | `/ChangeGenuine/DelChangeGenuineDoc` | - | - | Xóa phiếu thay đổi nguồn gốc | **DOCUMENTED** |
| `POST ChangeGenuine/GetChangeGenuineLst` | `POST` | `/ChangeGenuine/GetChangeGenuineLst` | - | - | Lấy danh sách phiếu | **DOCUMENTED** |
| `POST ChangeGenuine/GetChangeGenuineDocByID` | `POST` | `/ChangeGenuine/GetChangeGenuineDocByID` | - | - | Lấy chi tiết phiếu | **DOCUMENTED** |
| `POST ChangeGenuine/AppproveChangeGenuineDoc` | `POST` | `/ChangeGenuine/AppproveChangeGenuineDoc` | - | - | Phê duyệt phiếu | **DOCUMENTED** |
| `POST TransferCenter/CreateTransferCenter` | `POST` | `/TransferCenter/CreateTransferCenter` | - | - | Tạo mới phiếu chuyển kho giữa các trung tâm | **DOCUMENTED** |
| `POST TransferCenter/UpdateTransferCenter` | `POST` | `/TransferCenter/UpdateTransferCenter` | - | - | Cập nhật phiếu chuyển kho giữa các trung tâm | **DOCUMENTED** |
| `POST TransferCenter/GetTransferCenterByTime` | `POST` | `/TransferCenter/GetTransferCenterByTime` | - | - | Lấy danh sách phiếu chuyển kho giữa các trung tâm | **DOCUMENTED** |
| `POST TransferCenter/GetTransferCenterByID` | `POST` | `/TransferCenter/GetTransferCenterByID` | - | - | Lấy thông tin phiếu chuyển kho giữa các trung tâm theo ID | **DOCUMENTED** |
| `POST TransferCenter/DelTransferCenter` | `POST` | `/TransferCenter/DelTransferCenter` | - | - | Xóa phiếu chuyển kho giữa các trung tâm theo ID | **DOCUMENTED** |
| `POST TransferCenter/ApproveTransferCenter` | `POST` | `/TransferCenter/ApproveTransferCenter` | - | - | Phê duyệt phiếu chuyển kho giữa các trung tâm theo ID | **DOCUMENTED** |
| `POST TransferCenter/ConfirmPacking` | `POST` | `/TransferCenter/ConfirmPacking` | - | - | Xác nhận đã đóng hàng | **DOCUMENTED** |
| `POST TransferCenter/ApproveTransferCenterLine` | `POST` | `/TransferCenter/ApproveTransferCenterLine` | - | - | Phê duyệt phiếu chuyển kho giữa các trung tâm theo ID | **DOCUMENTED** |
| `POST TransferCenter/GetLotCodeExistByLotIndex` | `POST` | `/TransferCenter/GetLotCodeExistByLotIndex` | - | - | Kiểm tra thông tin lô nhảy trong kho tổng | **DOCUMENTED** |
| `POST File/UploadImageProduct?ProductID={ProductID}&Token={Token}&uPharmaID={uPharmaID}&TypeIm={TypeIm}` | `POST` | `/File/UploadImageProduct?ProductID={ProductID}&Token={Token}&uPharmaID={uPharmaID}&TypeIm={TypeIm}` | - | - | Upload ảnh của sản phẩm | **DOCUMENTED** |
| `GET File/DownloadImageProduct?uPharmaID={uPharmaID}&Token={Token}&ProductID={ProductID}&TypeIm={TypeIm}&Ratio={Ratio}` | `GET` | `/File/DownloadImageProduct?uPharmaID={uPharmaID}&Token={Token}&ProductID={ProductID}&TypeIm={TypeIm}&Ratio={Ratio}` | - | - | Hàm lấy ảnh của sản phẩm | **DOCUMENTED** |
| `POST File/UploadImageProductOrder?Token={Token}&uPharmaID={uPharmaID}&DocumentID={DocumentID}` | `POST` | `/File/UploadImageProductOrder?Token={Token}&uPharmaID={uPharmaID}&DocumentID={DocumentID}` | - | - | Upload ảnh của sản phẩm yêu cầu | **DOCUMENTED** |
| `GET File/DownloadImageProductOrder?uPharmaID={uPharmaID}&Token={Token}&DocumentID={DocumentID}` | `GET` | `/File/DownloadImageProductOrder?uPharmaID={uPharmaID}&Token={Token}&DocumentID={DocumentID}` | - | - | Hàm lấy ảnh của sản phẩm | **DOCUMENTED** |
| `GET File/DownloadImageProductKM?uPharmaID={uPharmaID}&Token={Token}&ProductID={ProductID}&Ratio={Ratio}` | `GET` | `/File/DownloadImageProductKM?uPharmaID={uPharmaID}&Token={Token}&ProductID={ProductID}&Ratio={Ratio}` | - | - | Hàm lấy ảnh của sản phẩm Km | **DOCUMENTED** |
| `POST File/UploadImageInvoiceDoc?HeaderID={HeaderID}&Token={Token}&uPharmaID={uPharmaID}&ProductLst={ProductLst}` | `POST` | `/File/UploadImageInvoiceDoc?HeaderID={HeaderID}&Token={Token}&uPharmaID={uPharmaID}&ProductLst={ProductLst}` | - | - | No documentation available. | **DOCUMENTED** |
| `GET File/DownloadImageInvoiceDoc?uPharmaID={uPharmaID}&Token={Token}&HeaderID={HeaderID}` | `GET` | `/File/DownloadImageInvoiceDoc?uPharmaID={uPharmaID}&Token={Token}&HeaderID={HeaderID}` | - | - | Hàm lấy ảnh của đơn hàng | **DOCUMENTED** |
| `POST File/UploadImageReturnShop?DocumentID={DocumentID}&Token={Token}&uPharmaID={uPharmaID}` | `POST` | `/File/UploadImageReturnShop?DocumentID={DocumentID}&Token={Token}&uPharmaID={uPharmaID}` | - | - | Upload ảnh trả lại hàng | **DOCUMENTED** |
| `GET File/DownloadImageReturnShop?uPharmaID={uPharmaID}&Token={Token}&DocumentID={DocumentID}` | `GET` | `/File/DownloadImageReturnShop?uPharmaID={uPharmaID}&Token={Token}&DocumentID={DocumentID}` | - | - | Hàm lấy ảnh của đơn hàng | **DOCUMENTED** |
| `POST File/UpFileImportStore?DocumentID={DocumentID}&Token={Token}&uPharmaID={uPharmaID}&TypeDoc={TypeDoc}&Note={Note}` | `POST` | `/File/UpFileImportStore?DocumentID={DocumentID}&Token={Token}&uPharmaID={uPharmaID}&TypeDoc={TypeDoc}&Note={Note}` | - | - | Upload File phiếu nhập kho | **DOCUMENTED** |
| `GET File/DownloadFileImportStore?uPharmaID={uPharmaID}&Token={Token}&FileID={FileID}` | `GET` | `/File/DownloadFileImportStore?uPharmaID={uPharmaID}&Token={Token}&FileID={FileID}` | - | - | Hàm lấy ảnh của đơn hàng | **DOCUMENTED** |
| `GET File/DelFileImportStore?uPharmaID={uPharmaID}&Token={Token}&FileID={FileID}` | `GET` | `/File/DelFileImportStore?uPharmaID={uPharmaID}&Token={Token}&FileID={FileID}` | - | - | Hàm lấy ảnh của đơn hàng | **DOCUMENTED** |
| `POST Supplier/CreateSupplier` | `POST` | `/Supplier/CreateSupplier` | - | - | Thêm nhà cung cấp | **DOCUMENTED** |
| `POST Supplier/UpdateSupplier` | `POST` | `/Supplier/UpdateSupplier` | - | - | Cập nhật nhà cung cấp | **DOCUMENTED** |
| `POST Supplier/DelSupplier` | `POST` | `/Supplier/DelSupplier` | - | - | Xóa nhà cung cấp | **DOCUMENTED** |
| `POST Supplier/GetSupplierLst` | `POST` | `/Supplier/GetSupplierLst` | - | - | Lấy danh sách nhà cung cấp | **DOCUMENTED** |
| `POST Supplier/GetSupplierByCode` | `POST` | `/Supplier/GetSupplierByCode` | - | - | Lấy thông tin nhà cung cấp theo mã | **DOCUMENTED** |
| `POST Supplier/GetSupplierByID` | `POST` | `/Supplier/GetSupplierByID` | - | - | Lấy thông tin nhà cung cấp theo mã | **DOCUMENTED** |
| `POST Supplier/GetSupplierFromFast` | `POST` | `/Supplier/GetSupplierFromFast` | - | - | - | **DOCUMENTED** |
| `POST Supplier/UpdateSupplierFile` | `POST` | `/Supplier/UpdateSupplierFile` | - | - | - | **DOCUMENTED** |
| `POST Supplier/DelSupplierFile` | `POST` | `/Supplier/DelSupplierFile` | - | - | - | **DOCUMENTED** |
| `POST Supplier/GetSupplierFileLst` | `POST` | `/Supplier/GetSupplierFileLst` | - | - | - | **DOCUMENTED** |
| `POST Supplier/GetSupplierFileOldLst` | `POST` | `/Supplier/GetSupplierFileOldLst` | - | - | - | **DOCUMENTED** |
| `POST Supplier/RenameSupplierFile` | `POST` | `/Supplier/RenameSupplierFile` | - | - | - | **DOCUMENTED** |
| `POST Supplier/CreateSupplierContact` | `POST` | `/Supplier/CreateSupplierContact` | - | - | - | **DOCUMENTED** |
| `POST Supplier/DelSupplierContact` | `POST` | `/Supplier/DelSupplierContact` | - | - | - | **DOCUMENTED** |
| `POST Supplier/GetSupplierContactLst` | `POST` | `/Supplier/GetSupplierContactLst` | - | - | - | **DOCUMENTED** |
| `POST Supplier/CreateSupplierBankAccount` | `POST` | `/Supplier/CreateSupplierBankAccount` | - | - | - | **DOCUMENTED** |
| `POST Supplier/DelSupplierBankAccount` | `POST` | `/Supplier/DelSupplierBankAccount` | - | - | - | **DOCUMENTED** |
| `POST Supplier/GetSupplierBankAccountLst` | `POST` | `/Supplier/GetSupplierBankAccountLst` | - | - | - | **DOCUMENTED** |
| `POST Supplier/AddSupplierCommit` | `POST` | `/Supplier/AddSupplierCommit` | - | - | - | **DOCUMENTED** |
| `POST Supplier/DelSupplierCommit` | `POST` | `/Supplier/DelSupplierCommit` | - | - | - | **DOCUMENTED** |
| `POST Supplier/GetSupplierCommitLst` | `POST` | `/Supplier/GetSupplierCommitLst` | - | - | - | **DOCUMENTED** |
| `POST Supplier/AddSupplierWork` | `POST` | `/Supplier/AddSupplierWork` | - | - | - | **DOCUMENTED** |
| `POST Supplier/DelSupplierWork` | `POST` | `/Supplier/DelSupplierWork` | - | - | - | **DOCUMENTED** |
| `POST Supplier/CompleteSupplierWork` | `POST` | `/Supplier/CompleteSupplierWork` | - | - | - | **DOCUMENTED** |
| `POST Supplier/GetSupplierWorkLst` | `POST` | `/Supplier/GetSupplierWorkLst` | - | - | - | **DOCUMENTED** |
| `POST TOOLCancelHeader/CreateCancelHeader` | `POST` | `/TOOLCancelHeader/CreateCancelHeader` | - | - | Tạo phiếu hủy CCDC | **DOCUMENTED** |
| `POST TOOLCancelHeader/UpdateCancelHeader` | `POST` | `/TOOLCancelHeader/UpdateCancelHeader` | - | - | Cập nhật phiếu hủy CCDC | **DOCUMENTED** |
| `POST TOOLCancelHeader/DelCancelHeader` | `POST` | `/TOOLCancelHeader/DelCancelHeader` | - | - | Xóa phiếu hủy CCDC | **DOCUMENTED** |
| `POST TOOLCancelHeader/ApproveCancelHeader` | `POST` | `/TOOLCancelHeader/ApproveCancelHeader` | - | - | Phê duyệt phiếu hủy CCDC | **DOCUMENTED** |
| `POST TOOLCancelHeader/GetCancelHeaderLst` | `POST` | `/TOOLCancelHeader/GetCancelHeaderLst` | - | - | Lấy danh sách phiếu hủy CCDC | **DOCUMENTED** |
| `POST TOOLCancelHeader/GetCancelHeaderByID` | `POST` | `/TOOLCancelHeader/GetCancelHeaderByID` | - | - | Lấy chi tiết phiếu hủy CCDC | **DOCUMENTED** |
| `POST KKInventory/GetProductToCheck` | `POST` | `/KKInventory/GetProductToCheck` | - | - | Lấy danh mục cần kiểm kê của SHOP trong ngày | **DOCUMENTED** |
| `POST KKInventory/CreateInventoryBySeller` | `POST` | `/KKInventory/CreateInventoryBySeller` | - | - | Tạo phiếu kiểm kê nhà thuốc Ver2 | **DOCUMENTED** |
| `POST KKInventory/CreateInventoryInfo` | `POST` | `/KKInventory/CreateInventoryInfo` | - | - | Tạo mới phiếu kiểm kê | **DOCUMENTED** |
| `POST KKInventory/CreateInventoryByKT` | `POST` | `/KKInventory/CreateInventoryByKT` | - | - | Tạo mới phiếu kiểm kê cho kế toán | **DOCUMENTED** |
| `POST KKInventory/ApproveInventoryInfo` | `POST` | `/KKInventory/ApproveInventoryInfo` | - | - | Phê duyệt phiếu kiểm kê | **DOCUMENTED** |
| `POST KKInventory/DelInventoryInfo` | `POST` | `/KKInventory/DelInventoryInfo` | - | - | Hủy phiếu kiểm kê | **DOCUMENTED** |
| `POST KKInventory/GetInventoryLstByTime` | `POST` | `/KKInventory/GetInventoryLstByTime` | - | - | Lấy danh sách phiếu kiểm kê theo thời gian | **DOCUMENTED** |
| `POST KKInventory/CheckLotCodeIndex` | `POST` | `/KKInventory/CheckLotCodeIndex` | - | - | check mã lô nhảy | **DOCUMENTED** |
| `POST KKInventory/GetInventoryInfo` | `POST` | `/KKInventory/GetInventoryInfo` | - | - | - | **DOCUMENTED** |
| `POST KKInventory/GetProductError` | `POST` | `/KKInventory/GetProductError` | - | - | Láy danh sách các sản phẩm kiểm kê lỗi | **DOCUMENTED** |
| `POST KKInventory/GetFrequencyProduct` | `POST` | `/KKInventory/GetFrequencyProduct` | - | - | Lấy danh sách tần suất kiểm kê | **DOCUMENTED** |
| `POST KKInventory/GetInventoryLstByPID` | `POST` | `/KKInventory/GetInventoryLstByPID` | - | - | Lấy danh sách kiểm kê theo sản phẩm | **DOCUMENTED** |
| `POST KKInventory/GetInventoryLotLstByPID` | `POST` | `/KKInventory/GetInventoryLotLstByPID` | - | - | Lấy danh sách tem kiểm kê theo sản phẩm | **DOCUMENTED** |
| `POST KKInventory/HandleProductError` | `POST` | `/KKInventory/HandleProductError` | - | - | Lấy danh sách tem kiểm kê theo sản phẩm | **DOCUMENTED** |
| `POST Policy/SetPriceSales` | `POST` | `/Policy/SetPriceSales` | - | - | Tạo mới chính sách | **DOCUMENTED** |
| `POST Policy/GetPriceSalesLst` | `POST` | `/Policy/GetPriceSalesLst` | - | - | Lấy danh sách chính sách | **DOCUMENTED** |
| `POST Policy/GetPriceNewLst` | `POST` | `/Policy/GetPriceNewLst` | - | - | Lấy danh sách sản phẩm mới đổi giá | **DOCUMENTED** |
| `POST Policy/GetPriceSalesByProductID` | `POST` | `/Policy/GetPriceSalesByProductID` | - | - | Lấy danh sách chính sách | **DOCUMENTED** |
| `POST Policy/GetPriceSalesApByProductID` | `POST` | `/Policy/GetPriceSalesApByProductID` | - | - | Lấy thông tin giá bán của 1 sản phẩm | **DOCUMENTED** |
| `POST Policy/DelPriceSales` | `POST` | `/Policy/DelPriceSales` | - | - | Xóa chính sách bán | **DOCUMENTED** |
| `POST Policy/GetPointSalesDefineLst` | `POST` | `/Policy/GetPointSalesDefineLst` | - | - | - | **DOCUMENTED** |
| `POST Policy/UpdatePointSalesDefine` | `POST` | `/Policy/UpdatePointSalesDefine` | - | - | - | **DOCUMENTED** |
| `POST Policy/GetPointSalesEmLst` | `POST` | `/Policy/GetPointSalesEmLst` | - | - | - | **DOCUMENTED** |
| `POST Policy/GetPointSalesEmDetailLst` | `POST` | `/Policy/GetPointSalesEmDetailLst` | - | - | - | **DOCUMENTED** |
| `POST Policy/GetPointSalesMore` | `POST` | `/Policy/GetPointSalesMore` | - | - | Lấy thông tin đào tạo sản phẩm hệ số | **DOCUMENTED** |
| `POST Policy/UpdatePointSalesMore` | `POST` | `/Policy/UpdatePointSalesMore` | - | - | Cập nhật thông tin đào tạo sản phẩm hệ số | **DOCUMENTED** |
| `POST Policy/CheckProductPrint` | `POST` | `/Policy/CheckProductPrint` | - | - | Cập nhật thông tin đào tạo sản phẩm hệ số | **DOCUMENTED** |
| `POST ReturnStore/CreateReturnDoc` | `POST` | `/ReturnStore/CreateReturnDoc` | - | - | Tạo phiếu trả hàng | **DOCUMENTED** |
| `POST ReturnStore/UpdateReturnDoc` | `POST` | `/ReturnStore/UpdateReturnDoc` | - | - | Cập nhật phiếu trả hàng | **DOCUMENTED** |
| `POST ReturnStore/DelReturnDoc` | `POST` | `/ReturnStore/DelReturnDoc` | - | - | Hủy phiếu trả hàng | **DOCUMENTED** |
| `POST ReturnStore/CheckStampForReturnDoc` | `POST` | `/ReturnStore/CheckStampForReturnDoc` | - | - | Kiếm tra hàng trả về | **DOCUMENTED** |
| `POST ReturnStore/GetReturnDocByTime` | `POST` | `/ReturnStore/GetReturnDocByTime` | - | - | Lấy danh sách hàng trả về | **DOCUMENTED** |
| `POST ReturnStore/GetReturnDocByID` | `POST` | `/ReturnStore/GetReturnDocByID` | - | - | Lấy chi tiết hàng trả về | **DOCUMENTED** |
| `POST ReturnStore/ApproveReturnDocLine` | `POST` | `/ReturnStore/ApproveReturnDocLine` | - | - | Lấy chi tiết hàng trả về | **DOCUMENTED** |
| `POST ShopGroup/GetGShopLst` | `POST` | `/ShopGroup/GetGShopLst` | - | - | Lấy danh sách nhóm cửa hàng | **DOCUMENTED** |
| `POST ShopGroup/GetGShopLineLst` | `POST` | `/ShopGroup/GetGShopLineLst` | - | - | Lấy danh sách nhóm cửa hàng | **DOCUMENTED** |
| `POST ShopGroup/DelGShop` | `POST` | `/ShopGroup/DelGShop` | - | - | Xóa nhóm cửa hàng | **DOCUMENTED** |
| `POST ShopGroup/UpdateGShop` | `POST` | `/ShopGroup/UpdateGShop` | - | - | Xóa nhóm cửa hàng | **DOCUMENTED** |
| `POST MHOrderLock/AddOrderLock` | `POST` | `/MHOrderLock/AddOrderLock` | - | - | Thêm sản phẩm chặn đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrderLock/DelOrderLock` | `POST` | `/MHOrderLock/DelOrderLock` | - | - | Xóa sản phẩm chặn đề xuất mua hàng | **DOCUMENTED** |
| `POST MHOrderLock/GetOrderLockLst` | `POST` | `/MHOrderLock/GetOrderLockLst` | - | - | Lấy danh sách sản phẩm chặn đề xuất mua hàng | **DOCUMENTED** |
| `POST Employee/GetEmployeeInfoByID` | `POST` | `/Employee/GetEmployeeInfoByID` | - | - | Lây thông tin nhân viên theo ID | **DOCUMENTED** |
| `POST Employee/GetInstructorByID` | `POST` | `/Employee/GetInstructorByID` | - | - | Lây thông tin người dẫn đơn | **DOCUMENTED** |
| `POST Employee/GetEmployeeInfoLst` | `POST` | `/Employee/GetEmployeeInfoLst` | - | - | Lây danh sách nhân viên | **DOCUMENTED** |
| `POST Employee/UpdateEmployeeInfo` | `POST` | `/Employee/UpdateEmployeeInfo` | - | - | Cập nhật thông tin nhân viên | **DOCUMENTED** |
| `POST Employee/AddEmployeeInfo` | `POST` | `/Employee/AddEmployeeInfo` | - | - | Thêm mới nhân viên | **DOCUMENTED** |
| `POST Employee/CheckNewEmployee` | `POST` | `/Employee/CheckNewEmployee` | - | - | Kiểm tra nhân viên mới | **DOCUMENTED** |
| `POST Employee/GetEmployeeOfShop` | `POST` | `/Employee/GetEmployeeOfShop` | - | - | - | **DOCUMENTED** |
| `POST CancelProduct/GetCancelProductByTime` | `POST` | `/CancelProduct/GetCancelProductByTime` | - | - | Lấy thông tin các phiếu hủy sản phẩm theo thời gian | **DOCUMENTED** |
| `POST CancelProduct/GetCancelProductByID` | `POST` | `/CancelProduct/GetCancelProductByID` | - | - | Lấy thông tin chi tiết phiếu hủy sản phẩm | **DOCUMENTED** |
| `POST CancelProduct/DelCancelProduct` | `POST` | `/CancelProduct/DelCancelProduct` | - | - | Xóa phiếu hủy sản phẩm | **DOCUMENTED** |
| `POST CancelProduct/ApproveCancelProduct` | `POST` | `/CancelProduct/ApproveCancelProduct` | - | - | Phê duyệt phiếu hủy sản phẩm | **DOCUMENTED** |
| `POST CancelProduct/CreateCancelProduct` | `POST` | `/CancelProduct/CreateCancelProduct` | - | - | Tạo phiếu hủy sản phẩm | **DOCUMENTED** |
| `POST CancelProduct/UpdateCancelProduct` | `POST` | `/CancelProduct/UpdateCancelProduct` | - | - | Cập nhật phiếu hủy sản phẩm | **DOCUMENTED** |
| `POST CancelProduct/GetCancelProductFollowLst` | `POST` | `/CancelProduct/GetCancelProductFollowLst` | - | - | Lấy danh sách theo dõi tình trạng hàng đổi trả | **DOCUMENTED** |
| `POST CancelProduct/UpCancelProductFollow` | `POST` | `/CancelProduct/UpCancelProductFollow` | - | - | Cập nhật tình trạng hàng đổi trả | **DOCUMENTED** |
| `POST SalesInvoice/GetLotCodeIndexBySales` | `POST` | `/SalesInvoice/GetLotCodeIndexBySales` | - | - | Quyét lô nhảy | **OBSERVED** |
| `POST SalesInvoice/GetLotCodeIndexOfSales` | `POST` | `/SalesInvoice/GetLotCodeIndexOfSales` | - | - | Kiểm tra lô nhảy của đơn hàng | **OBSERVED** |
| `POST SalesInvoice/CreateOrderHeader2` | `POST` | `/SalesInvoice/CreateOrderHeader2` | - | - | Thêm mới đơn hàng 2 | **OBSERVED** |
| `POST SalesInvoice/CheckAchievePromo` | `POST` | `/SalesInvoice/CheckAchievePromo` | - | - | Kiểm tra trước đơn đặt | **OBSERVED** |
| `POST SalesInvoice/CheckPromoOrder` | `POST` | `/SalesInvoice/CheckPromoOrder` | - | - | Check chương trình khuyến mại dựa vào đơn bán | **OBSERVED** |
| `POST SalesInvoice/ConfirmOrderHeaderByID` | `POST` | `/SalesInvoice/ConfirmOrderHeaderByID` | - | - | Xác nhận thanh toán | **OBSERVED** |
| `POST SalesInvoice/ConfirmDebtOrderHeaderByID` | `POST` | `/SalesInvoice/ConfirmDebtOrderHeaderByID` | - | - | Xác nhận thanh toán kèm công nợ | **OBSERVED** |
| `POST SalesInvoice/PaymentDebtOrderHeaderByID` | `POST` | `/SalesInvoice/PaymentDebtOrderHeaderByID` | - | - | Xác nhận thanh toán hết công nợ | **OBSERVED** |
| `POST SalesInvoice/DelOrderHeader` | `POST` | `/SalesInvoice/DelOrderHeader` | - | - | Hủy đơn hàng | **OBSERVED** |
| `POST SalesInvoice/UpdateOrderHeader2` | `POST` | `/SalesInvoice/UpdateOrderHeader2` | - | - | Câp nhật đơn hàng 2 | **OBSERVED** |
| `POST SalesInvoice/GetOrderInfoST` | `POST` | `/SalesInvoice/GetOrderInfoST` | - | - | Lấy thông tin người đặt đơn trên Sổ tay | **OBSERVED** |
| `POST SalesInvoice/GetOrderHeaderByID` | `POST` | `/SalesInvoice/GetOrderHeaderByID` | - | - | Lấy thông tin đơn đặt theo ID | **OBSERVED** |
| `POST SalesInvoice/GetOrderHeaderByQRCode` | `POST` | `/SalesInvoice/GetOrderHeaderByQRCode` | - | - | Lấy thông tin đơn đặt theo QRCode | **OBSERVED** |
| `POST SalesInvoice/GetOrderHeaderByShop` | `POST` | `/SalesInvoice/GetOrderHeaderByShop` | - | - | Lấy thông tin đơn hàng theo Shop | **OBSERVED** |
| `POST SalesInvoice/GetSalesHeaderByID` | `POST` | `/SalesInvoice/GetSalesHeaderByID` | - | - | Lấy thông tin đơn hàng theo ID | **OBSERVED** |
| `POST SalesInvoice/GetSalesHeaderByShop` | `POST` | `/SalesInvoice/GetSalesHeaderByShop` | - | - | Lấy thông tin đơn hàng theo Shop | **OBSERVED** |
| `POST SalesInvoice/GetReportSalesByShop` | `POST` | `/SalesInvoice/GetReportSalesByShop` | - | - | Lấy báo cáo đơn hàng theo Shop | **OBSERVED** |
| `POST SalesInvoice/GetReportSalesSpeed` | `POST` | `/SalesInvoice/GetReportSalesSpeed` | - | - | - | **OBSERVED** |
| `POST SalesInvoice/GetSalesLstByHandingOver` | `POST` | `/SalesInvoice/GetSalesLstByHandingOver` | - | - | - | **OBSERVED** |
| `POST SalesInvoice/SearchEmployeeCPC1HN` | `POST` | `/SalesInvoice/SearchEmployeeCPC1HN` | - | - | Tìm kiếm nhân viên CPC1HN | **OBSERVED** |
| `POST SalesInvoice/UpdateNoteInvoice` | `POST` | `/SalesInvoice/UpdateNoteInvoice` | - | - | Cập nhật thông tin ghi chú | **OBSERVED** |
| `POST SalesInvoice/UpdateNoteInvoice2` | `POST` | `/SalesInvoice/UpdateNoteInvoice2` | - | - | Cập nhật thông tin bệnh lý khách hàng | **OBSERVED** |
| `POST SalesInvoice/UpdateVNPayInvoice` | `POST` | `/SalesInvoice/UpdateVNPayInvoice` | - | - | Cập nhật thông tin VNPay | **OBSERVED** |
| `POST SalesInvoice/UpdateTypeInvoice` | `POST` | `/SalesInvoice/UpdateTypeInvoice` | - | - | Cập nhật thông tin loại hóa đơn | **OBSERVED** |
| `POST Stamp/GetQuantityStampSys` | `POST` | `/Stamp/GetQuantityStampSys` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetStampHistoryByLotIndex` | `POST` | `/Stamp/GetStampHistoryByLotIndex` | - | - | Lấy lịch sử sử dụng tem | **DOCUMENTED** |
| `POST Stamp/GetStampSysByDocID` | `POST` | `/Stamp/GetStampSysByDocID` | - | - | Lấy danh sách tem theo phiếu nhập | **DOCUMENTED** |
| `POST Stamp/GetLotCodeChangePrice` | `POST` | `/Stamp/GetLotCodeChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetLotCodeChangePackageID` | `POST` | `/Stamp/GetLotCodeChangePackageID` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetLotCodeChangePriceDetail` | `POST` | `/Stamp/GetLotCodeChangePriceDetail` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetLotCodeChangePackageIDDetail` | `POST` | `/Stamp/GetLotCodeChangePackageIDDetail` | - | - | - | **DOCUMENTED** |
| `POST Stamp/CreateDocChangePrice` | `POST` | `/Stamp/CreateDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/UpdateDocChangePrice` | `POST` | `/Stamp/UpdateDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/CreateDocChangePackageID` | `POST` | `/Stamp/CreateDocChangePackageID` | - | - | - | **DOCUMENTED** |
| `POST Stamp/UpdateDocChangePackageID` | `POST` | `/Stamp/UpdateDocChangePackageID` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetLotCodeChangeByID` | `POST` | `/Stamp/GetLotCodeChangeByID` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetLotCodeChangeHeaderLst` | `POST` | `/Stamp/GetLotCodeChangeHeaderLst` | - | - | - | **DOCUMENTED** |
| `POST Stamp/ApproveDocChangePrice` | `POST` | `/Stamp/ApproveDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/DelDocChangePrice` | `POST` | `/Stamp/DelDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/CreateCDocChangePrice` | `POST` | `/Stamp/CreateCDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/GetCDocChangePriceLst` | `POST` | `/Stamp/GetCDocChangePriceLst` | - | - | - | **DOCUMENTED** |
| `POST Stamp/DelCDocChangePrice` | `POST` | `/Stamp/DelCDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST Stamp/ApproveCDocChangePrice` | `POST` | `/Stamp/ApproveCDocChangePrice` | - | - | - | **DOCUMENTED** |
| `POST FileShop/UploadFileShop?uPharmaID={uPharmaID}&Token={Token}&FileName={FileName}&ShopCode={ShopCode}` | `POST` | `/FileShop/UploadFileShop?uPharmaID={uPharmaID}&Token={Token}&FileName={FileName}&ShopCode={ShopCode}` | - | - | Upload File shop | **DOCUMENTED** |
| `GET FileShop/DownloadFileShop?uPharmaID={uPharmaID}&Token={Token}&FileCode={FileCode}&ShopCode={ShopCode}` | `GET` | `/FileShop/DownloadFileShop?uPharmaID={uPharmaID}&Token={Token}&FileCode={FileCode}&ShopCode={ShopCode}` | - | - | DownloadFileShop | **DOCUMENTED** |
| `POST ShiftWork/GetShiftWorkDefine` | `POST` | `/ShiftWork/GetShiftWorkDefine` | - | - | Danh sách các ca làm việc | **DOCUMENTED** |
| `POST ShiftWork/CreateShiftWork` | `POST` | `/ShiftWork/CreateShiftWork` | - | - | Tạo ca làm việc | **DOCUMENTED** |
| `POST ShiftWork/DelShiftWork` | `POST` | `/ShiftWork/DelShiftWork` | - | - | Xóa ca làm việc | **DOCUMENTED** |
| `POST ShiftWork/ApproveShiftWork` | `POST` | `/ShiftWork/ApproveShiftWork` | - | - | Phê duyệt ca làm việc | **DOCUMENTED** |
| `POST ShiftWork/GetShiftWorkByTime` | `POST` | `/ShiftWork/GetShiftWorkByTime` | - | - | Lấy danh sách ca làm việc | **DOCUMENTED** |
| `POST ShiftWork/GetTimeKeepingLst` | `POST` | `/ShiftWork/GetTimeKeepingLst` | - | - | Lấy thông tin chấm công | **DOCUMENTED** |
| `POST ShiftWork/GetDetailTimeKeepingByEm` | `POST` | `/ShiftWork/GetDetailTimeKeepingByEm` | - | - | Lấy thông tin chấm công | **DOCUMENTED** |
| `POST Stamp2/GetImportSysLineDesLst` | `POST` | `/Stamp2/GetImportSysLineDesLst` | - | - | - | **DOCUMENTED** |
| `POST Stamp2/GetLotCodeIndexCLst` | `POST` | `/Stamp2/GetLotCodeIndexCLst` | - | - | - | **DOCUMENTED** |
| `POST Stamp2/ConnectLotCodeIndexC` | `POST` | `/Stamp2/ConnectLotCodeIndexC` | - | - | - | **DOCUMENTED** |
| `POST Stamp2/DelLotCodeIndexC` | `POST` | `/Stamp2/DelLotCodeIndexC` | - | - | - | **DOCUMENTED** |
| `POST Buyer/SearchBuyer` | `POST` | `/Buyer/SearchBuyer` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetBuyerByCardID` | `POST` | `/Buyer/GetBuyerByCardID` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetBuyerByID` | `POST` | `/Buyer/GetBuyerByID` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetBuyerLst` | `POST` | `/Buyer/GetBuyerLst` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetBuyerLstByTime` | `POST` | `/Buyer/GetBuyerLstByTime` | - | - | lấy danh sách khách hàng theo thời gian | **DOCUMENTED** |
| `POST Buyer/GetBuyerLstWithLevel` | `POST` | `/Buyer/GetBuyerLstWithLevel` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetDetailBuyerLst` | `POST` | `/Buyer/GetDetailBuyerLst` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetBuyerDiagnoseByBID` | `POST` | `/Buyer/GetBuyerDiagnoseByBID` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetSalesHeaderLastByBID` | `POST` | `/Buyer/GetSalesHeaderLastByBID` | - | - | - | **DOCUMENTED** |
| `POST Buyer/GetCustomerNewLst` | `POST` | `/Buyer/GetCustomerNewLst` | - | - | - | **DOCUMENTED** |
| `POST Buyer/SearchBuyerFamiliar` | `POST` | `/Buyer/SearchBuyerFamiliar` | - | - | Tìm khách hàng thân quen | **DOCUMENTED** |
| `POST Buyer/UpdateBuyerFamiliar` | `POST` | `/Buyer/UpdateBuyerFamiliar` | - | - | Cập nhật khách hàng thân quen | **DOCUMENTED** |
| `POST Buyer/GetBuyerCall` | `POST` | `/Buyer/GetBuyerCall` | - | - | - | **DOCUMENTED** |
| `POST Buyer/NoteBuyerCall` | `POST` | `/Buyer/NoteBuyerCall` | - | - | Ghi chú thông tin cuộc gọi | **DOCUMENTED** |

---
*Báo cáo được khởi tạo tự động theo chuẩn OpenAPI 3.0.3.*
