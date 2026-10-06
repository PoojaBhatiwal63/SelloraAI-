export interface AnalyticsPartner {
  id: string;
  name: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
}

export interface AnalyticsProduct {
  id: string;
  title: string;
  type: string;
  price: number;
  totalSales: number;
  totalRevenue: number;
}

export interface AnalyticsOrder {
  productTitle: string;
  partnerAmount: number;
  createdAt: string;
}

export interface AnalyticsData {
  partner: AnalyticsPartner;
  summary: AnalyticsSummary;
  products: AnalyticsProduct[];
  orders: AnalyticsOrder[];
}

export interface AIInsight {
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
}

export interface AIAnalytics {
  summary: string;

  insights: AIInsight[];

  recommendations: string[];

  topProduct: {
    title: string;
    reason: string;
  };

  growthOpportunity: string;
}