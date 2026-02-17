// RevenueCat subscription service
// Note: Requires native build (expo prebuild) to work with actual Apple/Google Play purchases

import Purchases from 'react-native-purchases';

// RevenueCat API key
const REVENUECAT_API_KEY = 'sk_wLhbKPVGUpSbLVNGkfrYVtPXzgCcq';

// Package names for the app
const ANDROID_PACKAGE = 'com.momentum.habits';
const IOS_PACKAGE = 'com.momentum.habits';

export interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  expirationDate: string;
  productIdentifier: string;
}

export const RevenueCatService = {
  // Initialize RevenueCat
  async initialize(): Promise<void> {
    try {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      console.log('RevenueCat initialized');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  },

  // Get current subscriber info
  async getSubscriberInfo(): Promise<EntitlementInfo | null> {
    try {
      const purchaserInfo = await Purchases.getPurchaserInfo();
      
      // Check for premium entitlement
      const entitlements = purchaserInfo.entitlements;
      const premium = entitlements?.active['premium'];
      
      if (premium) {
        return {
          identifier: premium.identifier,
          isActive: premium.isActive,
          willRenew: premium.willRenew,
          periodType: premium.periodType,
          latestPurchaseDate: premium.latestPurchaseDate,
          expirationDate: premium.expirationDate,
          productIdentifier: premium.productIdentifier,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting subscriber info:', error);
      return null;
    }
  },

  // Check if user is premium
  async isPremium(): Promise<boolean> {
    const info = await this.getSubscriberInfo();
    return info?.isActive ?? false;
  },

  // Restore purchases (for when user reinstalls app)
  async restorePurchases(): Promise<boolean> {
    try {
      await Purchases.restoreTransactions();
      const info = await this.getSubscriberInfo();
      return info?.isActive ?? false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  },

  // Get available products (for display)
  async getProducts(): Promise<any[]> {
    try {
      const products = await Purchases.getProducts(['momentum_premium_monthly', 'momentum_premium_yearly']);
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  // Make a purchase
  async purchaseProduct(productId: string): Promise<boolean> {
    try {
      const { product } = await Purchases.getProducts([productId]);
      if (product) {
        const { purchaseTransaction } = await Purchases.makePurchase(product);
        return purchaseTransaction?.transactionIdentifier != null;
      }
      return false;
    } catch (error) {
      // ErrorCode.PURCHASE_CANCELLED means user cancelled
      console.error('Purchase error:', error);
      return false;
    }
  },

  // Set user ID (for attribution)
  async setUserId(userId: string): Promise<void> {
    try {
      await Purchases.identify(userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  },

  // Log out (when user signs out)
  async logOut(): Promise<void> {
    try {
      await Purchases.reset();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
};
