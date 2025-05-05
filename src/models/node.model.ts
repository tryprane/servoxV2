import mongoose , {Document , Schema} from "mongoose";



export interface INODE extends Document {

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

const nodeSchema = new Schema(

    {

        name:{
            type:String,
            required: true,
            unique:true,
            trim: true,
        },
        nodeImg:{

            type: String,
            required:true

        },
        isAvailable:{
            type: Boolean
        },
        category:{
            type: String
        },
        nodeLink: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
          monthly: {
            type: Number
          },
          quaterly:{
            type: Number
          },
          biannually:{
            type: Number
          }
        },

        inputData: [
            {
              fieldName: {
                type: String,
                
              },
            },
          ],
          outputData: [
            {
              fieldName: {
                type: String,
              },
            },
          ],
       

    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

export const NodePlan = mongoose.model<INODE>('NodePlan' , nodeSchema)