import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { companies } from '@/config/companies';

export async function GET(request: Request) {
    try {
        // Get company from query params or default to rthmn
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('company') || 'rthmn';
        const company = companies[companyId];

        if (!company?.stripe) {
            throw new Error(`Stripe configuration not found for company: ${companyId}`);
        }

        const stripe = new Stripe(company.stripe.secretKey, {
            apiVersion: '2025-02-24.acacia',
        });

        // Get total revenue from balance transactions
        const balanceTransactions = await stripe.balanceTransactions.list({
            limit: 100,
            type: 'charge',
        });

        // Get customers
        const customers = await stripe.customers.list({
            limit: 100,
        });

        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            limit: 100,
            status: 'active',
        });

        // Get recent payments
        const payments = await stripe.paymentIntents.list({
            limit: 10,
        });

        // Calculate total revenue
        const totalRevenue = balanceTransactions.data.reduce((total, tx) => {
            return total + (tx.amount || 0) / 100;
        }, 0);

        // Calculate MRR from active subscriptions
        const mrr = subscriptions.data.reduce((total, sub) => {
            const price = sub.items.data[0]?.price;
            if (!price) return total;
            return total + (price.unit_amount || 0) / 100;
        }, 0);

        return NextResponse.json({
            total_revenue: totalRevenue,
            total_customers: customers.data.length,
            total_subscriptions: subscriptions.data.length,
            mrr,
            recent_payments: payments.data.map((payment) => ({
                id: payment.id,
                amount: payment.amount / 100,
                customer: payment.customer,
                status: payment.status,
                created_at: new Date(payment.created * 1000).toISOString(),
            })),
        });
    } catch (error) {
        console.error('Error fetching payment metrics:', error);
        return NextResponse.json({ error: 'Failed to fetch payment metrics' }, { status: 500 });
    }
}
