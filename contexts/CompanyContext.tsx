'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { CompanyConfig, getCompanyConfig, getAllCompanyConfigs } from '@/config/companies';

interface CompanyContextType {
    selectedCompany: CompanyConfig | null;
    setSelectedCompany: (company: CompanyConfig) => void;
    companies: CompanyConfig[];
    isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [selectedCompany, setSelectedCompany] = useState<CompanyConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const companies = getAllCompanyConfigs();

    useEffect(() => {
        // Load the last selected company from localStorage
        const lastCompanyId = localStorage.getItem('selectedCompanyId');
        if (lastCompanyId) {
            try {
                const company = getCompanyConfig(lastCompanyId);
                setSelectedCompany(company);
            } catch (error) {
                console.error('Error loading company:', error);
            }
        } else if (companies.length > 0) {
            // If no company is selected, use the first one
            setSelectedCompany(companies[0]);
        }
        setIsLoading(false);
    }, []);

    const handleSetSelectedCompany = (company: CompanyConfig) => {
        setSelectedCompany(company);
        localStorage.setItem('selectedCompanyId', company.id);
    };

    return (
        <CompanyContext.Provider
            value={{
                selectedCompany,
                setSelectedCompany: handleSetSelectedCompany,
                companies,
                isLoading,
            }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}
