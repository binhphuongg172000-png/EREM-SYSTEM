// Hằng số định danh vai trò người dùng
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SALE: 'SALE',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Hằng số trạng thái tài khoản
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Hằng số trạng thái Dự trù kinh phí
export const PROPOSAL_STATUS = {
  DRAFT: 'DRAFT', // Bản nháp, có thể sửa/xóa
  PENDING: 'PENDING', // Chờ duyệt
  APPROVED: 'APPROVED', // Đã duyệt (Đóng băng, Sale không được sửa)
  REJECTED: 'REJECTED', // Từ chối duyệt (Sale có thể sửa lại)
} as const;

export type ProposalStatus = typeof PROPOSAL_STATUS[keyof typeof PROPOSAL_STATUS];

// Hằng số trạng thái Biên bản bàn giao (BBBG)
export const HANDOVER_STATUS = {
  PENDING: 'PENDING', // Chờ xác nhận
  CONFIRMED: 'CONFIRMED', // Đã xác nhận (Maker-Checker hoàn tất)
} as const;

export type HandoverStatus = typeof HANDOVER_STATUS[keyof typeof HANDOVER_STATUS];

// Ràng buộc file đính kèm
export const ATTACHMENT_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'image/jpeg',
    'image/png',
  ],
} as const;

// Hằng số khác
export const BUDGET_CALC = {
  UNIT_PRICE_FACTOR: 100000000 / 105, // 100M / 105
} as const;
