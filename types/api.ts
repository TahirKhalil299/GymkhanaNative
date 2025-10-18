export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data?: T | null;
};

export type MemberInfo = {
  memberId: string;
  memberName: string;
  memberType: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  balance: number;
};

export type MenuItem = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  isAvailable: boolean;
};

export type MenuList = {
  outletName: string;
  items: MenuItem[];
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  orderNumber: string;
  memberId: string;
  memberType: string;
  memberName?: string | null;
  tableNo?: string | null;
  waiterId?: string | null;
  waiterName?: string | null;
  serviceType: 'DINING_IN' | 'TAKE_AWAY';
  outletName: string;
  items: CartItem[];
  subTotal: number;
  tax: number;
  serviceCharge: number;
  grandTotal: number;
  itemCount: number;
  timestamp: string; // ISO
  status: 'Open' | 'Processed' | 'Closed';
};







