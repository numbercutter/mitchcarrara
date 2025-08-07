import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/contexts/CompanyContext';
import { companies } from '@/config/companies';
import Image from 'next/image';
import { useState } from 'react';

export function CompanySelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedCompany, setSelectedCompany } = useCompany();

    const companyList = Object.values(companies);

    return (
        <div className='relative'>
            <Button variant='outline' className='flex w-full items-center justify-between' onClick={() => setIsOpen(!isOpen)}>
                <div className='flex items-center gap-2'>
                    {selectedCompany && (
                        <div className='relative h-5 w-5'>
                            <Image src={selectedCompany.logo} alt={selectedCompany.name} fill className='rounded-sm object-contain' />
                        </div>
                    )}
                    <span>{selectedCompany?.name || 'Select company...'}</span>
                </div>
            </Button>

            {isOpen && (
                <Card className='absolute z-50 mt-1 w-full'>
                    <CardContent className='p-2'>
                        {companyList.map((company) => (
                            <Button
                                key={company.id}
                                variant='ghost'
                                className='mb-1 w-full justify-start gap-2 last:mb-0'
                                onClick={() => {
                                    setSelectedCompany(company);
                                    setIsOpen(false);
                                }}>
                                <div className='relative h-5 w-5'>
                                    <Image src={company.logo} alt={company.name} fill className='rounded-sm object-contain' />
                                </div>
                                {company.name}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
