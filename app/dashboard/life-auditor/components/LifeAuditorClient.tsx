'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BarChart3, TrendingUp, Save, History, Settings, Info, Target, Timer } from 'lucide-react';
import FibonacciSelector from './FibonacciSelector';
import HistoryChart from './HistoryChart';
import WeightsConfig from './WeightsConfig';

// Fibonacci values with descriptions
const FIBONACCI_VALUES = [
    { value: 1, label: 'Crisis', description: 'Severely neglected / crisis' },
    { value: 2, label: 'Very Weak', description: 'Very weak / unstable' },
    { value: 3, label: 'Barely Functional', description: 'Barely functional / inconsistent' },
    { value: 5, label: 'Below Average', description: 'Below average / patchwork fixes' },
    { value: 8, label: 'Solid', description: 'Solid but improvable / maintained' },
    { value: 13, label: 'Strong', description: 'Strong / dependable, occasional slack' },
    { value: 21, label: 'Excellent', description: 'Excellent / high-performing, scalable' },
    { value: 34, label: 'Peak', description: 'Peak / exemplary / transforms other areas' },
];

// Detailed descriptions for each life area at each Fibonacci level
const DETAILED_DESCRIPTIONS: Record<string, Record<number, string>> = {
    spirituality_score: {
        1: 'No spiritual practice, feeling lost or disconnected from purpose',
        2: 'Occasional spiritual thoughts but no consistent practice or framework',
        3: 'Basic spiritual awareness, sporadic meditation or prayer',
        5: 'Regular spiritual practice (weekly), some sense of purpose',
        8: 'Daily spiritual practice, clear personal values, occasional insights',
        13: 'Deep spiritual discipline, strong sense of purpose, helps others find meaning',
        21: 'Profound spiritual wisdom, teaches/mentors others, unshakeable inner peace',
        34: 'Spiritual mastery like the Dalai Lama, Gandhi, or modern spiritual leaders - transforms communities through presence and wisdom',
    },
    mindset_mental_health_score: {
        1: 'Chronic anxiety/depression, overwhelmed by stress, negative self-talk dominates',
        2: 'Frequent mental health struggles, poor stress management, seeking help',
        3: 'Some coping strategies, occasional therapy, still reactive to stress',
        5: 'Basic stress management tools, mostly stable mood, working on growth',
        8: 'Good emotional regulation, resilient mindset, practices self-care consistently',
        13: 'Strong mental resilience, helps others with their mindset, rarely shaken',
        21: 'Exceptional mental strength, coaches others, maintains calm under extreme pressure',
        34: 'Mental fortitude like Navy SEALs, Olympic champions, or top CEOs - unbreakable mindset that inspires others',
    },
    emotional_mastery_score: {
        1: 'Emotions completely out of control, frequent outbursts or numbness',
        2: 'Struggling with emotional regulation, reactive, seeking emotional tools',
        3: 'Basic emotional awareness, learning to pause before reacting',
        5: 'Can manage emotions in normal situations, occasional emotional lapses',
        8: 'Good emotional intelligence, can navigate difficult conversations well',
        13: 'Exceptional emotional mastery, helps others process emotions, natural mediator',
        21: 'Emotional wisdom like a master therapist, transforms others through emotional guidance',
        34: 'Emotional genius like Oprah or Rogers - creates profound emotional healing and growth in everyone they touch',
    },
    intellectual_growth_score: {
        1: 'No learning habits, mental stagnation, avoiding intellectual challenges',
        2: 'Sporadic learning, mostly consuming shallow content',
        3: 'Some reading/learning, basic curiosity about new topics',
        5: 'Regular learning habit, reads books, takes some courses',
        8: 'Voracious learner, constantly developing new skills, intellectually curious',
        13: 'Polymath tendencies, expertise in multiple domains, teaches others',
        21: 'Intellectual powerhouse, recognized expert, contributes new knowledge to field',
        34: 'Intellectual giant like Einstein, Da Vinci, or Musk - revolutionizes multiple fields and pushes human knowledge forward',
    },
    identity_self_image_score: {
        1: 'No self-confidence, identity crisis, feels worthless or lost',
        2: 'Poor self-image, frequent self-doubt, comparing to others constantly',
        3: 'Building self-awareness, working on confidence, occasional self-doubt',
        5: 'Decent self-confidence, knows strengths/weaknesses, mostly authentic',
        8: 'Strong sense of self, confident in abilities, authentic in relationships',
        13: 'Unshakeable self-confidence, inspires confidence in others, natural leader',
        21: 'Powerful authentic presence, helps others discover their identity',
        34: 'Iconic self-mastery like Muhammad Ali, Steve Jobs, or Mandela - radiates unshakeable confidence that transforms others',
    },
    physical_health_score: {
        1: 'Multiple health issues, no energy, neglecting basic health needs',
        2: 'Poor health habits, frequent illness, low energy levels',
        3: 'Some health awareness, inconsistent healthy choices',
        5: 'Basic health habits, annual checkups, moderate energy levels',
        8: 'Good health practices, rarely sick, consistent energy throughout day',
        13: 'Excellent health, optimized nutrition/sleep, helps others with health',
        21: 'Peak health optimization, bio-hacking, teaching health principles',
        34: 'Health mastery like longevity researchers, Navy SEALs, or elite athletes - body operates at superhuman levels',
    },
    fitness_strength_score: {
        1: 'Sedentary lifestyle, very poor physical condition, avoiding physical activity',
        2: 'Minimal exercise, poor fitness level, easily winded',
        3: 'Sporadic exercise, below average fitness, building habits',
        5: 'Regular exercise routine, average fitness level, some strength',
        8: 'Consistent training, good fitness, strong and capable',
        13: 'Excellent fitness, inspires others, could compete at amateur level',
        21: 'Elite amateur athlete, coaches others, exceptional physical capabilities',
        34: 'Athletic mastery like Olympic athletes, special forces, or world-class performers - body is a finely tuned machine',
    },
    nutrition_recovery_score: {
        1: 'Terrible diet, poor sleep, no recovery practices, always exhausted',
        2: 'Inconsistent nutrition, sleep issues, basic recovery awareness',
        3: 'Some nutrition knowledge, improving sleep, learning recovery',
        5: 'Decent diet and sleep routine, some recovery practices',
        8: 'Optimized nutrition, excellent sleep hygiene, good recovery protocols',
        13: 'Nutrition expert level, perfect sleep optimization, teaches others',
        21: 'Biohacking nutrition and recovery, helping others optimize',
        34: 'Recovery mastery like elite athletes or longevity experts - every aspect of nutrition and recovery optimized for peak performance',
    },
    appearance_style_score: {
        1: 'Neglecting grooming and appearance, no sense of style',
        2: 'Basic hygiene, poor fashion sense, little attention to appearance',
        3: 'Decent grooming, learning about style, some effort',
        5: 'Good grooming habits, developing personal style, well-presented',
        8: 'Excellent grooming, strong personal style, confident appearance',
        13: 'Impeccable style, helps others with appearance, natural fashion sense',
        21: "Style mastery, could work in fashion/styling, influences others' style",
        34: 'Style icon like David Beckham, Ryan Gosling, or top fashion influencers - appearance inspires and influences culture',
    },
    vitality_sexual_health_score: {
        1: 'No vitality, sexual health issues, very low energy and libido',
        2: 'Low energy, sexual health concerns, seeking solutions',
        3: 'Building vitality, addressing sexual health, some improvement',
        5: 'Good energy levels, healthy sexual function, balanced hormones',
        8: 'High vitality, excellent sexual health, optimized hormones',
        13: 'Peak vitality and sexual wellness, helps others optimize',
        21: 'Vitality mastery, teaches optimization, exceptional life force',
        34: 'Vitality like ancient warriors or tantric masters - radiates powerful life force energy that energizes others',
    },
    romantic_relationship_score: {
        1: 'Toxic or non-existent relationships, severe relationship dysfunction',
        2: 'Struggling relationships, poor communication, seeking help',
        3: 'Learning relationship skills, some improvement in connections',
        5: 'Decent relationship, good communication most of the time',
        8: 'Strong relationship, excellent communication, mutual growth',
        13: 'Exceptional relationship mastery, helps other couples, deep intimacy',
        21: 'Relationship wisdom, counsels others, creates profound connections',
        34: 'Relationship mastery like relationship gurus or power couples - love so deep it inspires others to transform their relationships',
    },
    family_score: {
        1: 'Toxic family relationships, estranged, major unresolved conflicts',
        2: 'Strained family relationships, poor communication, working on healing',
        3: 'Improving family connections, better boundaries, some healing',
        5: 'Good family relationships, healthy communication, mutual respect',
        8: 'Strong family bonds, excellent communication, source of support',
        13: 'Exceptional family harmony, helps heal family dysfunction in others',
        21: 'Family wisdom, creates healing across generations, family patriarch/matriarch',
        34: 'Family mastery like family therapy pioneers - creates multi-generational healing and becomes a model family others aspire to',
    },
    friendships_brotherhood_score: {
        1: 'Isolated, no close friends, poor social connections',
        2: 'Few shallow friendships, loneliness, working on social skills',
        3: 'Some friendships, building social confidence, developing connections',
        5: 'Good friend group, reliable relationships, mutual support',
        8: 'Strong brotherhood/sisterhood, deep friendships, natural connector',
        13: 'Exceptional friend and community builder, brings people together',
        21: 'Master of relationships, creates powerful communities and networks',
        34: 'Social mastery like community leaders or great hosts - creates brotherhoods/sisterhoods that transform lives and communities',
    },
    networking_social_status_score: {
        1: 'No professional network, poor reputation, social anxiety',
        2: 'Limited network, working on social skills, building connections',
        3: 'Growing network, some social confidence, developing reputation',
        5: 'Good professional network, decent reputation, comfortable socially',
        8: 'Strong network, respected reputation, influential in circles',
        13: 'Powerful network, high social status, opens doors for others',
        21: 'Master networker, significant influence, shapes communities',
        34: 'Social influence like top CEOs or cultural leaders - network and status create massive positive impact and opportunities for others',
    },
    contribution_to_others_score: {
        1: 'Self-focused, not helping others, no service or mentorship',
        2: 'Minimal contribution, occasionally helps, mostly focused on self',
        3: 'Some volunteering or helping, building service habits',
        5: 'Regular contribution, mentors someone, gives back consistently',
        8: 'Significant service, mentors multiple people, creates positive impact',
        13: "Major contributor, transforms others' lives, recognized for service",
        21: 'Service mastery, creates organizations or movements helping many',
        34: 'Service like Mother Teresa or great philanthropists - life dedicated to uplifting humanity with massive positive impact',
    },
    career_mission_score: {
        1: 'Hate job, no sense of purpose, work feels meaningless',
        2: 'Struggling with career, seeking purpose, unfulfilled at work',
        3: 'Some career satisfaction, exploring purpose, making progress',
        5: 'Good job alignment, clear career path, some sense of mission',
        8: 'Strong career trajectory, work aligns with values, clear purpose',
        13: 'Exceptional career success, mission-driven work, inspiring others',
        21: 'Career mastery, industry leader, creates meaningful impact through work',
        34: 'Career legacy like Jobs, Bezos, or great leaders - work becomes a calling that transforms industries and inspires generations',
    },
    financial_health_score: {
        1: 'Financial crisis, debt problems, living paycheck to paycheck',
        2: 'Financial struggles, poor money habits, working on basic stability',
        3: 'Some financial stability, learning money management, building emergency fund',
        5: 'Good financial habits, emergency fund, paying down debt',
        8: 'Strong financial position, investing regularly, multiple income streams',
        13: 'Excellent wealth building, financial independence approaching, helps others',
        21: 'Financial mastery, multiple businesses, teaching wealth building',
        34: 'Wealth mastery like top investors or entrepreneurs - creates generational wealth and financial freedom for many others',
    },
    skills_competence_score: {
        1: 'Limited skills, no expertise, struggling with basic competence',
        2: 'Basic skills, working on improvement, developing competencies',
        3: 'Decent skill level, some expertise areas, building confidence',
        5: 'Good skills in key areas, competent professional, reliable',
        8: 'High skill level, recognized expertise, sought after for abilities',
        13: 'Master level skills, teaches others, top 10% in field',
        21: 'Exceptional expertise, industry leader, creates new methods',
        34: 'Skill mastery like Da Vinci or modern polymaths - world-class expertise in multiple domains that advances human capability',
    },
    business_entrepreneurship_score: {
        1: 'Employee mindset, no business skills, afraid of entrepreneurship',
        2: 'Learning business basics, side hustle attempts, building confidence',
        3: 'Some business experience, small ventures, developing skills',
        5: 'Successful side business or good business role, solid skills',
        8: 'Strong business acumen, successful ventures, natural entrepreneur',
        13: 'Business mastery, multiple successful ventures, mentors others',
        21: 'Serial entrepreneur, major business success, industry influence',
        34: 'Business genius like Musk, Gates, or Branson - creates world-changing companies and inspires entrepreneurial revolution',
    },
    time_management_productivity_score: {
        1: 'Time chaos, procrastination dominates, no productivity systems',
        2: 'Poor time management, struggling with priorities, seeking systems',
        3: 'Basic time management, some productivity tools, improving',
        5: 'Good time management, productive routines, clear priorities',
        8: 'Excellent productivity, optimized systems, helps others manage time',
        13: 'Time mastery, extremely efficient, teaches productivity systems',
        21: 'Productivity guru level, creates systems others adopt',
        34: 'Time mastery like top performers or productivity experts - every moment optimized for maximum impact and deep work',
    },
    home_living_environment_score: {
        1: 'Chaotic living space, no organization, environment detracts from life',
        2: 'Poor organization, cluttered, working on basic cleanliness',
        3: 'Decent organization, some systems, improving living space',
        5: 'Good home environment, organized, comfortable and functional',
        8: 'Excellent living space, beautiful and organized, sanctuary-like',
        13: 'Home mastery, creates beautiful spaces, helps others organize',
        21: "Living environment expertise, influences others' spaces",
        34: 'Home mastery like top designers or minimalist masters - living environment so optimized it enhances every aspect of life',
    },
    adventure_play_score: {
        1: 'No fun or adventure, life feels dull and routine',
        2: 'Minimal fun, working on adding play, seeking adventure',
        3: 'Some adventures, building fun habits, exploring hobbies',
        5: 'Regular adventures, good work-life balance, enjoys life',
        8: 'Rich adventure life, travels, plays regularly, great experiences',
        13: 'Adventure mastery, creates experiences for others, lives fully',
        21: 'Adventure wisdom, inspires others to live boldly, master of experiences',
        34: 'Adventure mastery like great explorers or experience creators - life so rich with adventure it inspires others to live fully',
    },
    creativity_expression_score: {
        1: 'No creative outlets, feels artistically dead, unexpressed',
        2: 'Minimal creativity, wanting to express but struggling to start',
        3: 'Some creative activities, building artistic confidence',
        5: 'Regular creative practice, developing artistic skills',
        8: 'Strong creative expression, good artistic skills, creates regularly',
        13: 'Creative mastery, helps others express creatively, artistic leadership',
        21: "Creative genius, influences others' creativity, artistic innovation",
        34: 'Creative mastery like great artists or innovators - creativity so powerful it transforms culture and inspires artistic movements',
    },
    freedom_autonomy_score: {
        1: 'Feeling trapped, no control over life, dependent on others',
        2: 'Limited freedom, working toward independence, some constraints',
        3: 'Some autonomy, building independence, making own choices',
        5: 'Good personal freedom, mostly independent, controls own schedule',
        8: 'Strong autonomy, location/time freedom, makes own rules',
        13: 'Complete freedom mastery, helps others gain independence',
        21: "Freedom wisdom, creates systems for others' liberation",
        34: 'Freedom mastery like digital nomad pioneers or freedom philosophers - complete autonomy that inspires others to break free',
    },
    legacy_long_term_vision_score: {
        1: 'No long-term vision, living day to day, no legacy thinking',
        2: 'Some future thinking, working on vision, unclear legacy',
        3: 'Developing vision, some legacy awareness, building purpose',
        5: 'Clear long-term vision, working toward meaningful legacy',
        8: 'Strong vision execution, building significant legacy',
        13: 'Visionary leadership, inspiring others toward long-term thinking',
        21: 'Legacy mastery, creates movements that outlast lifetime',
        34: 'Legacy like great leaders or visionaries - creates generational impact that transforms humanity for centuries',
    },
};

// Life areas configuration
const LIFE_AREAS = {
    'The Self (Inner World)': [
        { key: 'spirituality_score', label: 'Spirituality / Higher Meaning', description: 'Connection to something bigger (God, universe, purpose, philosophy)' },
        { key: 'mindset_mental_health_score', label: 'Mindset & Mental Health', description: 'Resilience, self-talk, stress management' },
        { key: 'emotional_mastery_score', label: 'Emotional Mastery', description: 'Ability to feel, regulate, and express emotions without repression or chaos' },
        { key: 'intellectual_growth_score', label: 'Intellectual Growth', description: 'Learning, curiosity, skill development, mental sharpness' },
        { key: 'identity_self_image_score', label: 'Identity & Self-Image', description: 'How you see yourself, confidence, authenticity' },
    ],
    'The Body (Physical Realm)': [
        { key: 'physical_health_score', label: 'Physical Health', description: 'General wellness, absence of illness, energy levels' },
        { key: 'fitness_strength_score', label: 'Fitness & Strength', description: 'Athleticism, stamina, body composition' },
        { key: 'nutrition_recovery_score', label: 'Nutrition & Recovery', description: 'Diet, sleep, recovery habits' },
        { key: 'appearance_style_score', label: 'Appearance & Style', description: 'Grooming, fashion, physical presentation' },
        { key: 'vitality_sexual_health_score', label: 'Vitality & Sexual Health', description: 'Libido, testosterone, sexual satisfaction' },
    ],
    'Relationships & Social Life': [
        { key: 'romantic_relationship_score', label: 'Romantic / Intimate Relationship(s)', description: 'Quality of dating life or long-term partnership' },
        { key: 'family_score', label: 'Family', description: 'Relationship with parents, siblings, children' },
        { key: 'friendships_brotherhood_score', label: 'Friendships / Brotherhood', description: 'Social circle, ride-or-die friends, community' },
        { key: 'networking_social_status_score', label: 'Networking & Social Status', description: 'Connections, influence, respect from peers' },
        { key: 'contribution_to_others_score', label: 'Contribution to Others', description: 'Service, mentorship, helping others rise' },
    ],
    'Work & Wealth': [
        { key: 'career_mission_score', label: 'Career / Mission', description: 'Alignment of work with purpose' },
        { key: 'financial_health_score', label: 'Financial Health', description: 'Savings, investments, freedom vs. paycheck-to-paycheck' },
        { key: 'skills_competence_score', label: 'Skills & Competence', description: 'Mastery, market value, adaptability' },
        { key: 'business_entrepreneurship_score', label: 'Business / Entrepreneurship', description: 'Ownership, leadership, risk-taking (if applicable)' },
        { key: 'time_management_productivity_score', label: 'Time Management & Productivity', description: 'Control over schedule, priorities' },
    ],
    'Lifestyle & Environment': [
        { key: 'home_living_environment_score', label: 'Home / Living Environment', description: 'Comfort, organization, safety' },
        { key: 'adventure_play_score', label: 'Adventure & Play', description: 'Fun, travel, hobbies, experiences' },
        { key: 'creativity_expression_score', label: 'Creativity & Expression', description: 'Art, music, writing, building, creating' },
        { key: 'freedom_autonomy_score', label: 'Freedom & Autonomy', description: 'Control over your own choices, not trapped' },
        { key: 'legacy_long_term_vision_score', label: 'Legacy & Long-Term Vision', description: 'The "big why," impact beyond yourself' },
    ],
};

interface LifeAuditorClientProps {
    initialAudit: any;
    initialHistory: any[];
    initialWeights: any;
}

export default function LifeAuditorClient({ initialAudit, initialHistory, initialWeights }: LifeAuditorClientProps) {
    const [audit, setAudit] = useState(initialAudit || {});
    const [history, setHistory] = useState(initialHistory);
    const [weights, setWeights] = useState(initialWeights);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [currentView, setCurrentView] = useState<'audit' | 'analytics' | 'settings'>('audit');

    // Auto-save functionality
    const saveAudit = useCallback(
        async (auditData = audit) => {
            setIsSaving(true);
            try {
                const response = await fetch('/api/life-audits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(auditData),
                });

                if (!response.ok) throw new Error('Failed to save audit');

                const savedAudit = await response.json();
                setAudit(savedAudit);
                setLastSaved(new Date());

                // Refresh history
                const historyResponse = await fetch('/api/life-audits/history');
                if (historyResponse.ok) {
                    const newHistory = await historyResponse.json();
                    setHistory(newHistory);
                }
            } catch (error) {
                console.error('Error saving audit:', error);
            } finally {
                setIsSaving(false);
            }
        },
        [audit]
    );

    // Auto-save every 30 seconds if there are changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (Object.keys(audit).length > 0) {
                saveAudit();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [saveAudit]);

    const updateScore = (key: string, value: number) => {
        const newAudit = { ...audit, [key]: value };
        setAudit(newAudit);
    };

    const getCompositeScore = () => {
        if (!audit.composite_percentage) return 0;
        return audit.composite_percentage;
    };

    const getScoreInterpretation = (percentage: number) => {
        if (percentage < 20) return { label: 'Critical', color: 'destructive', description: 'Rescue mode on some buckets' };
        if (percentage < 40) return { label: 'Fragile', color: 'warning', description: 'A few important areas are leaking energy' };
        if (percentage < 60) return { label: 'Stable', color: 'secondary', description: 'Functioning but not flourishing' };
        if (percentage < 80) return { label: 'Strong', color: 'primary', description: 'Plenty working, optimize and scale' };
        return { label: 'Exceptional', color: 'success', description: 'Legacy-building territory' };
    };

    const compositeScore = getCompositeScore();
    const interpretation = getScoreInterpretation(compositeScore);

    return (
        <div className='flex h-full flex-col space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>Life Auditor</h1>
                    <p className='text-muted-foreground'>Track your life using the Fibonacci Magnitude Scale (FMS)</p>
                </div>
                <div className='flex items-center gap-2'>
                    {lastSaved && <span className='text-xs text-muted-foreground'>Last saved: {lastSaved.toLocaleTimeString()}</span>}
                    <Button variant={currentView === 'audit' ? 'default' : 'outline'} size='sm' onClick={() => setCurrentView('audit')}>
                        <Target className='mr-1 h-4 w-4' />
                        Life Audit
                    </Button>
                    <Button variant={currentView === 'analytics' ? 'default' : 'outline'} size='sm' onClick={() => setCurrentView('analytics')}>
                        <BarChart3 className='mr-1 h-4 w-4' />
                        Analytics
                    </Button>
                    <Button variant={currentView === 'settings' ? 'default' : 'outline'} size='sm' onClick={() => setCurrentView('settings')}>
                        <Settings className='mr-1 h-4 w-4' />
                        Settings
                    </Button>
                    <Button onClick={() => saveAudit()} disabled={isSaving} size='sm'>
                        <Save className='mr-1 h-4 w-4' />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            {currentView === 'audit' && (
                <>
                    {/* Composite Score */}
                    <Card className='p-6'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h2 className='text-xl font-semibold'>Life Magnitude Score</h2>
                            <div className='flex items-center space-x-4'>
                                <div className='text-right'>
                                    <div className='text-3xl font-bold'>{compositeScore.toFixed(1)}%</div>
                                    <Badge variant={interpretation.color as any}>{interpretation.label}</Badge>
                                </div>
                            </div>
                        </div>
                        <Progress value={compositeScore} className='mb-2 h-3' />
                        <p className='text-sm text-muted-foreground'>{interpretation.description}</p>
                    </Card>

                    {/* Fibonacci Scale Reference */}
                    <Card className='p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>Fibonacci Magnitude Scale (FMS)</h3>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                            {FIBONACCI_VALUES.map((fib) => (
                                <div key={fib.value} className='flex items-center space-x-2'>
                                    <Badge variant='outline' className='w-8 justify-center'>
                                        {fib.value}
                                    </Badge>
                                    <div>
                                        <div className='text-sm font-medium'>{fib.label}</div>
                                        <div className='text-xs text-muted-foreground'>{fib.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator className='my-4' />
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
                            <div>
                                <Badge variant='destructive' className='mb-1'>
                                    0-20%
                                </Badge>
                                <div className='text-sm font-medium'>Critical</div>
                                <div className='text-xs text-muted-foreground'>Rescue mode</div>
                            </div>
                            <div>
                                <Badge variant='secondary' className='mb-1'>
                                    20-40%
                                </Badge>
                                <div className='text-sm font-medium'>Fragile</div>
                                <div className='text-xs text-muted-foreground'>Leaking energy</div>
                            </div>
                            <div>
                                <Badge variant='outline' className='mb-1'>
                                    40-60%
                                </Badge>
                                <div className='text-sm font-medium'>Stable</div>
                                <div className='text-xs text-muted-foreground'>Functioning</div>
                            </div>
                            <div>
                                <Badge variant='default' className='mb-1'>
                                    60-80%
                                </Badge>
                                <div className='text-sm font-medium'>Strong</div>
                                <div className='text-xs text-muted-foreground'>Optimize & scale</div>
                            </div>
                            <div>
                                <Badge className='mb-1 bg-green-600'>80-100%</Badge>
                                <div className='text-sm font-medium'>Exceptional</div>
                                <div className='text-xs text-muted-foreground'>Legacy building</div>
                            </div>
                        </div>
                    </Card>

                    {/* Life Areas */}
                    <div className='grid grid-cols-1 gap-6'>
                        {Object.entries(LIFE_AREAS).map(([category, areas]) => (
                            <Card key={category} className='p-6'>
                                <h2 className='mb-4 text-xl font-semibold text-primary'>{category}</h2>
                                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
                                    {areas.map((area) => (
                                        <div key={area.key} className='space-y-2'>
                                            <div>
                                                <label className='text-sm font-medium'>{area.label}</label>
                                                <p className='text-xs text-muted-foreground'>{area.description}</p>
                                            </div>
                                            <FibonacciSelector
                                                value={audit[area.key] || 1}
                                                onChange={(value) => updateScore(area.key, value)}
                                                fibonacciValues={FIBONACCI_VALUES}
                                                areaKey={area.key}
                                                detailedDescriptions={DETAILED_DESCRIPTIONS}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {currentView === 'analytics' && <HistoryChart history={history} />}

            {currentView === 'settings' && (
                <Card className='p-6'>
                    <h3 className='mb-4 text-lg font-semibold'>Category Weights</h3>
                    <WeightsConfig initialWeights={weights} onWeightsChange={setWeights} lifeAreas={LIFE_AREAS} />
                </Card>
            )}
        </div>
    );
}
