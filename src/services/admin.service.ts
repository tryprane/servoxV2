import { INODE , NodePlan} from "../models/node.model";
import { NodeOrder, INODEOrder } from "../models/nodeOrder.model";
import {redisClient } from '../config/redis.config'
import { User } from "../models/user.model";

interface nodePlan{

    name: string;
    nodeImg:string;
    isAvailable:boolean;
    category: string
    nodeLink: string;
    description: string;
    price: {
        monthly?:number;
        quaterly?:number;
        biannually?:number;
    }
    inputData?: {
        fieldName: string;
        
      }[];
      outputData?: {
        fieldName: string;
        
      }[];
}

interface adminData {
  totalPlans: number;
  totalOrders: number;
  totalUsers: number;
}


export class AdminService{

    static async postPlan(planData: nodePlan): Promise<{plan: INODE; msg: string}> {


        const plan = await NodePlan.create(planData);
        const msg = 'node posted succesfully'
        await redisClient.del('nodePlans')

        return {plan , msg}

    }

    static async getPostedPlan(): Promise<INODE[]>{
        const cacheKey = 'nodePlans';
        try {
            const cachedPlans = await redisClient.get(cacheKey);
            if(cachedPlans){
                return JSON.parse(cachedPlans);

            }

            const plans = await NodePlan.find();
            await redisClient.setex(cacheKey , 86400 , JSON.stringify(plans))

            return plans
        } catch (error) {
            console.error('Error fetching VPS plans:', error);
            throw error;
        }
    }

    static async changeAvailability(nodeId:any, availability:string) {
        try {
          // Validate that nodeId is provided
          if (!nodeId) {
            throw new Error('Node ID is required');
          }
          
          // Validate that availability is a boolean
          
          
          // Update the node's availability
          const updatedNode = await NodePlan.findByIdAndUpdate(
            nodeId,
            { availability : availability },
            { new: true } // Return the updated document
          );
          
          // Check if node exists
          if (!updatedNode) {
            throw new Error('Node plan not found');
          }
          
          return updatedNode;
        } catch (error) {
          throw error;
        }
      }

      static async getAdminData(): Promise<adminData>{
        const totalPlans = await NodePlan.countDocuments();
        const totalOrders = await NodeOrder.countDocuments();
        const totalUsers = await User.countDocuments();
        return {totalPlans, totalOrders, totalUsers};
      }


      static async updateOrderStatus(
        orderId: string, 
        status: 'pending' | 'processing' | 'deployed' | 'failed' | 'cancelled' | 'expired',
        deployDate?: Date,
        expiryDate?: Date
      ) {
        try {
          if (!orderId) {
            throw new Error('Order ID is required');
          }
    
          // Build update object
          const updateData: Partial<INODEOrder> = { status };
          
          // Add dates if provided and status is deployed
          if (status === 'deployed') {
            if (deployDate) updateData.deployDate = deployDate;
            if (expiryDate) updateData.expiryDate = expiryDate;
          }
    
          const updatedOrder = await NodeOrder.findOneAndUpdate(
            { orderId },
            updateData,
            { new: true, runValidators: true }
          );
    
          if (!updatedOrder) {
            throw new Error('Order not found');
          }
    
          return updatedOrder;
        } catch (error) {
          throw error;
        }
      }


      static async getOrdersByStatus(
        status?: string, 
        page: number = 1, 
        limit: number = 10, 
        sortBy: string = 'orderDate', 
        sortOrder: string = 'desc',
        startDate?: Date,
        endDate?: Date
      ) {
        try {
          // Build filter object
          const filter: any = {};
          
          // Add status filter if provided
          if (status && status !== 'all') {
            filter.status = status;
          }
          
          // Add date range filter if provided
          if (startDate || endDate) {
            filter.orderDate = {};
            if (startDate) filter.orderDate.$gte = startDate;
            if (endDate) filter.orderDate.$lte = endDate;
          }
    
          // Calculate skip for pagination
          const skip = (page - 1) * limit;
          
          // Build sort object
          const sort: any = {};
          sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
          // Execute query with pagination
          const orders = await NodeOrder.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('nodeId', 'name nodeImg nodeLink');
    
          // Get total count for pagination
          const totalOrders = await NodeOrder.countDocuments(filter);
          
          return {
            orders,
            pagination: {
              total: totalOrders,
              page,
              limit,
              pages: Math.ceil(totalOrders / limit)
            }
          };
        } catch (error) {
          throw error;
        }
      }


      static async updateOrderOutputData(
        orderId: string,
        outputData: Array<{ fieldName: string, fieldValue: string }>
      ) {
        try {
          if (!orderId) {
            throw new Error('Order ID is required');
          }
    
          if (!Array.isArray(outputData)) {
            throw new Error('Output data must be an array');
          }
    
          // Validate outputData format
          outputData.forEach(field => {
            if (!field.fieldName || !field.fieldValue) {
              throw new Error('Each output data field must have fieldName and fieldValue');
            }
          });
    
          const updatedOrder = await NodeOrder.findOneAndUpdate(
            { orderId },
            { outputData },
            { new: true, runValidators: true }
          );
    
          if (!updatedOrder) {
            throw new Error('Order not found');
          }
    
          return updatedOrder;
        } catch (error) {
          throw error;
        }
      }

      static async updateHeroImage(
        name: string,
        imgLink: string,
        mobLink?: string,
        tabLink?: string
      ) {

        

      }


    
      static async listOfUsers(){

        const users = await User.find();
        return users;

      }

      static async listOfOrders(){

        const orders = await NodeOrder.find();
        return orders;

      }

      static async deleteUser(userId: string){

        const user = await User.findByIdAndDelete(userId);
        return user;

      }
      
    





}