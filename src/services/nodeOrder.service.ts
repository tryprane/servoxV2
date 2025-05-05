import { NodeOrder , INODEOrder } from "../models/nodeOrder.model";
import { NodePlan , INODE } from "../models/node.model";
import{logger } from '../utils/logger'
import { Schema } from "mongoose";


export class NodeOrderService {
  static async createOrder(data: {
    walletId: string;
    nodeId: Schema.Types.ObjectId | string;
    planDuration: 'monthly' | 'quaterly' | 'biannually';
    node: {
      nodeId: string;
      name: string;
      nodeImg: string;
      nodeLink: string;
    };
    inputData?: { fieldName: string; fieldValue: string }[];
  }): Promise<INODEOrder> {
    try {
      // Fetch the node plan details
      const nodePlan = await NodePlan.findById(data.nodeId);
      if (!nodePlan) {
        throw new Error('Invalid Node Plan Selected');
      }

      // Generate a unique orderId (you might want to implement your own logic)
      const orderId = `NODE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Calculate amount based on planDuration
      const amount = this.fetchAmount(nodePlan, data.planDuration);
      
      // Calculate expiryDate based on planDuration
      const expiryDate = this.calculateExpiryDate(data.planDuration);
      
      // Create orderData object
      const orderData: Partial<INODEOrder> = {
        orderId,
        walletId: data.walletId,
        nodeId: data.nodeId,
        planDuration: data.planDuration,
        node: data.node,
        amount,
        status: 'pending',
        orderDate: new Date(),
        expiryDate
      };
      
      // If inputData is provided, use it; otherwise, fetch from nodePlan
      if (data.inputData && data.inputData.length > 0) {
        orderData.inputData = data.inputData;
      } else if (nodePlan.inputData && nodePlan.inputData.length > 0) {
        // Assuming nodePlan has inputFields property
        orderData.inputData = nodePlan.inputData.map(field => ({
          fieldName: field.fieldName,
          fieldValue:  ''
        }));
      }
      
      // Copy outputFields from nodePlan if available
      if (nodePlan.outputData && nodePlan.outputData.length > 0) {
        // Assuming nodePlan has outputData property
        orderData.outputData = nodePlan.outputData.map(field => ({
          fieldName: field.fieldName,
          fieldValue: ''
        }));
      }
      
      const order = await NodeOrder.create(orderData);
      logger.info(`Node Order created: ${order.orderId}`);
      return order;
      
    } catch (error) {
      logger.error('Node Order creation error:', error);
      throw error;
    }
  }

  static async getUserOrders(walletId: string): Promise<INODEOrder[]> {
    return NodeOrder.find({ walletId });
  }

  static async getOrderById(orderId: string): Promise<INODEOrder | null> {
    return NodeOrder.findOne({ orderId });
  }

  static async renewOrder(orderId: string): Promise<INODEOrder> {
    try {
      // Fetch the existing order
      const existingOrder = await NodeOrder.findOne({ orderId });
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Check if the order is eligible for renewal (not cancelled or failed)
      if (existingOrder.status === 'cancelled' || existingOrder.status === 'failed') {
        throw new Error(`Cannot renew order with status: ${existingOrder.status}`);
      }

      // Generate a new unique orderId
      const newOrderId = `NODE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Fetch the node plan details to get the latest pricing
      const nodePlan = await NodePlan.findById(existingOrder.nodeId);
      if (!nodePlan) {
        throw new Error('Node Plan not found');
      }

      // Calculate amount based on planDuration
      const amount = this.fetchAmount(nodePlan, existingOrder.planDuration);
      
      // Calculate new expiryDate based on planDuration
      const expiryDate = this.calculateExpiryDate(existingOrder.planDuration);
      
      // Create orderData object for the renewed order
      const renewedOrderData: Partial<INODEOrder> = {
        orderId: newOrderId,
        walletId: existingOrder.walletId,
        nodeId: existingOrder.nodeId,
        planDuration: existingOrder.planDuration,
        node: existingOrder.node,
        amount,
        status: 'pending',
        orderDate: new Date(),
        expiryDate
      };
      
      // Copy inputData from existing order if available
      if (existingOrder.inputData && existingOrder.inputData.length > 0) {
        renewedOrderData.inputData = existingOrder.inputData;
      }
      
      // Copy outputData from existing order if available
      if (existingOrder.outputData && existingOrder.outputData.length > 0) {
        renewedOrderData.outputData = existingOrder.outputData;
      }
      
      const renewedOrder = await NodeOrder.create(renewedOrderData);
      logger.info(`Node Order renewed: ${renewedOrder.orderId} (from original: ${orderId})`);
      return renewedOrder;
      
    } catch (error) {
      logger.error('Node Order renewal error:', error);
      throw error;
    }
  }

  static async renewOrderWithChanges(
    orderId: string, 
    changes: {
      planDuration?: 'monthly' | 'quaterly' | 'biannually';
      inputData?: { fieldName: string; fieldValue: string }[];
    }
  ): Promise<INODEOrder> {
    try {
      // Fetch the existing order
      const existingOrder = await NodeOrder.findOne({ orderId });
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Check if the order is eligible for renewal (not cancelled or failed)
      if (existingOrder.status === 'cancelled' || existingOrder.status === 'failed') {
        throw new Error(`Cannot renew order with status: ${existingOrder.status}`);
      }

      // Generate a new unique orderId
      const newOrderId = `NODE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Fetch the node plan details to get the latest pricing
      const nodePlan = await NodePlan.findById(existingOrder.nodeId);
      if (!nodePlan) {
        throw new Error('Node Plan not found');
      }

      // Determine the plan duration (use the new one if provided, otherwise use the existing one)
      const planDuration = changes.planDuration || existingOrder.planDuration;
      
      // Calculate amount based on planDuration
      const amount = this.fetchAmount(nodePlan, planDuration);
      
      // Calculate new expiryDate based on planDuration
      const expiryDate = this.calculateExpiryDate(planDuration);
      
      // Create orderData object for the renewed order
      const renewedOrderData: Partial<INODEOrder> = {
        orderId: newOrderId,
        walletId: existingOrder.walletId,
        nodeId: existingOrder.nodeId,
        planDuration,
        node: existingOrder.node,
        amount,
        status: 'pending',
        orderDate: new Date(),
        expiryDate
      };
      
      // Handle inputData - use provided changes, or existing data, or from node plan
      if (changes.inputData && changes.inputData.length > 0) {
        renewedOrderData.inputData = changes.inputData;
      } else if (existingOrder.inputData && existingOrder.inputData.length > 0) {
        renewedOrderData.inputData = existingOrder.inputData;
      } else if (nodePlan.inputData && nodePlan.inputData.length > 0) {
        renewedOrderData.inputData = nodePlan.inputData.map(field => ({
          fieldName: field.fieldName,
          fieldValue: ''
        }));
      }
      
      // Copy outputData from existing order if available, or from node plan
      if (existingOrder.outputData && existingOrder.outputData.length > 0) {
        renewedOrderData.outputData = existingOrder.outputData;
      } else if (nodePlan.outputData && nodePlan.outputData.length > 0) {
        renewedOrderData.outputData = nodePlan.outputData.map(field => ({
          fieldName: field.fieldName,
          fieldValue: ''
        }));
      }
      
      const renewedOrder = await NodeOrder.create(renewedOrderData);
      logger.info(`Node Order renewed with changes: ${renewedOrder.orderId} (from original: ${orderId})`);
      return renewedOrder;
      
    } catch (error) {
      logger.error('Node Order renewal with changes error:', error);
      throw error;
    }
  }

  static async renewExpiredOrder(orderId: string): Promise<INODEOrder> {
    try {
      // Fetch the existing order
      const existingOrder = await NodeOrder.findOne({ orderId });
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Check if the order is expired or about to expire
      const isExpired = existingOrder.status === 'expired' || 
                        (existingOrder.expiryDate && existingOrder.expiryDate < new Date());
      
      if (!isExpired) {
        throw new Error('Order is not expired and cannot be renewed using this method');
      }

      // Generate a new unique orderId
      const newOrderId = `NODE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Fetch the node plan details to get the latest pricing
      const nodePlan = await NodePlan.findById(existingOrder.nodeId);
      if (!nodePlan) {
        throw new Error('Node Plan not found');
      }

      // Calculate amount based on planDuration
      const amount = this.fetchAmount(nodePlan, existingOrder.planDuration);
      
      // Calculate new expiryDate based on planDuration, starting from current date
      const expiryDate = this.calculateExpiryDate(existingOrder.planDuration);
      
      // Create orderData object for the renewed order
      const renewedOrderData: Partial<INODEOrder> = {
        orderId: newOrderId,
        walletId: existingOrder.walletId,
        nodeId: existingOrder.nodeId,
        planDuration: existingOrder.planDuration,
        node: existingOrder.node,
        amount,
        status: 'pending', // Reset to pending since it's a new order
        orderDate: new Date(),
        expiryDate
      };
      
      // Copy inputData from existing order if available
      if (existingOrder.inputData && existingOrder.inputData.length > 0) {
        renewedOrderData.inputData = existingOrder.inputData;
      }
      
      // Copy outputData from existing order if available
      if (existingOrder.outputData && existingOrder.outputData.length > 0) {
        renewedOrderData.outputData = existingOrder.outputData;
      }
      
      const renewedOrder = await NodeOrder.create(renewedOrderData);
      logger.info(`Expired Node Order renewed: ${renewedOrder.orderId} (from original: ${orderId})`);
      
      // Optionally, update the status of the old order to indicate it has been renewed
      await NodeOrder.findOneAndUpdate(
        { orderId: existingOrder.orderId },
        { $set: { status: 'expired' } }
      );
      
      return renewedOrder;
      
    } catch (error) {
      logger.error('Expired Node Order renewal error:', error);
      throw error;
    }
  }

  static fetchAmount(plan: any, planDuration: 'monthly' | 'quaterly' | 'biannually'): number {
    // Assuming the plan model has pricing fields for different durations
    const price = plan.price?.[planDuration] || plan.price?.monthly || 0;
    return price;
  }

  static calculateExpiryDate(planDuration: 'monthly' | 'quaterly' | 'biannually'): Date {
    const expiryDate = new Date();
    
    switch (planDuration) {
      case 'monthly':
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case 'quaterly': // Note: typo in your schema, should be 'quarterly'
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case 'biannually':
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        break;
    }
    
    return expiryDate;
  }

  /**
   * Check if an order is about to expire within the specified days
   * @param order The node order to check
   * @param daysThreshold Number of days before expiry to check (default: 7)
   * @returns Boolean indicating if the order is about to expire
   */
  static isOrderAboutToExpire(order: INODEOrder, daysThreshold: number = 7): boolean {
    if (!order.expiryDate) {
      return false;
    }

    const now = new Date();
    const expiryDate = new Date(order.expiryDate);
    
    // Calculate the difference in milliseconds
    const diffTime = expiryDate.getTime() - now.getTime();
    
    // Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return true if the difference is less than or equal to the threshold
    return diffDays <= daysThreshold && diffDays > 0;
  }

  /**
   * Find all orders that are about to expire within the specified days
   * @param daysThreshold Number of days before expiry to check (default: 7)
   * @returns Array of orders that are about to expire
   */
  static async getOrdersAboutToExpire(daysThreshold: number = 7): Promise<INODEOrder[]> {
    try {
      // Calculate the date threshold
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
      
      // Find orders where:
      // 1. expiryDate is not null
      // 2. expiryDate is before the threshold date
      // 3. expiryDate is after the current date (not already expired)
      // 4. status is not 'cancelled' or 'failed'
      const orders = await NodeOrder.find({
        expiryDate: { $ne: null, $lte: thresholdDate, $gt: new Date() },
        status: { $nin: ['cancelled', 'failed', 'expired'] }
      });
      
      return orders;
    } catch (error) {
      logger.error('Error fetching orders about to expire:', error);
      throw error;
    }
  }

  /**
   * Bulk renew multiple orders at once
   * @param orderIds Array of order IDs to renew
   * @returns Object containing successful and failed renewals
   */
  static async bulkRenewOrders(orderIds: string[]): Promise<{
    successful: INODEOrder[];
    failed: { orderId: string; reason: string }[];
  }> {
    const successful: INODEOrder[] = [];
    const failed: { orderId: string; reason: string }[] = [];

    // Process each order ID sequentially
    for (const orderId of orderIds) {
      try {
        const renewedOrder = await this.renewOrder(orderId);
        successful.push(renewedOrder);
        logger.info(`Successfully renewed order: ${orderId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({ orderId, reason: errorMessage });
        logger.error(`Failed to renew order ${orderId}: ${errorMessage}`);
      }
    }

    return { successful, failed };
  }

  /**
   * Auto-renew all orders that are about to expire within the specified days
   * @param daysThreshold Number of days before expiry to check (default: 7)
   * @returns Object containing successful and failed renewals
   */
 
}
