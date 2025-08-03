import { NodePlan ,INODE } from "../models/node.model";

interface Counting {
    available: number,
    upcoming: number,
    expired: number
}

export class PlanService {

    static async getPlanCounting(): Promise<Counting> {
        const available = await NodePlan.countDocuments({ availability: 'available' });
        const upcoming = await NodePlan.countDocuments({ availability: 'upcoming' });
        const expired = await NodePlan.countDocuments({ availability: 'expired' });

        return { available, upcoming, expired };
    }

    static async getAvailablePlans(): Promise<INODE[]> {
        return NodePlan.find({ availability: 'available' });
    }
    static async getUpcomingPlans(): Promise<INODE[]> {
        return NodePlan.find({ availability: 'upcoming' });
    }
    static async getExpiredPlans(): Promise<INODE[]> {
        return NodePlan.find({ availability: 'expired' });
    }
}
