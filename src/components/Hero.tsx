import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomButton from './ui/CustomButton';
import { Calendar, Users } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10" />
      <div className="absolute inset-0 opacity-30 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/20 rounded-full filter blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-primary">e</span>Roster: Smart Scheduling Solution
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your scheduling process with our intuitive roster system.
            Submit availability, create schedules, and keep your team in sync.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CustomButton 
              size="lg" 
              onClick={() => navigate('/employee')}
              icon={<Users size={20} />}
            >
              I'm an Employee
            </CustomButton>
            
            <CustomButton 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/manager')}
              icon={<Calendar size={20} />}
            >
              I'm a Manager
            </CustomButton>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 w-full max-w-4xl"
        >
          {/* App Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-40 bottom-0" />
            <div className="bg-card rounded-xl shadow-elevated overflow-hidden border border-border">
              <div className="p-4 border-b border-border bg-secondary/50 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="text-sm text-center flex-1">eRoster Preview</div>
              </div>
              <div className="h-[400px] grid grid-cols-7 gap-1 p-4 bg-card">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="flex flex-col h-full">
                    <div className="text-xs text-center py-1 font-medium">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex]}
                    </div>
                    <div className="flex-1 bg-secondary/50 rounded-md p-2 text-xs overflow-hidden">
                      {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + (dayIndex * 0.1) + (i * 0.1) }}
                          className="mb-1 p-1 rounded bg-primary/10 border border-primary/20 text-primary-foreground/80"
                        >
                          {['John', 'Emma', 'Liam', 'Olivia', 'Noah'][Math.floor(Math.random() * 5)]}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 grid md:grid-cols-3 gap-8 w-full"
        >
          <FeatureCard 
            icon={<Calendar className="text-primary" />}
            title="Submit Availability"
            description="Employees can easily submit their availability for upcoming schedules."
            delay={0.9}
          />
          
          <FeatureCard 
            icon={<Users className="text-primary" />}
            title="Create Rosters"
            description="Managers can quickly create rosters based on employee availability."
            delay={1.0}
          />
          
          <FeatureCard 
            icon={<Calendar className="text-primary" />}
            title="View Schedule"
            description="Everyone can view the final schedule in a clean, intuitive interface."
            delay={1.1}
          />
        </motion.div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card rounded-xl p-6 shadow-subtle card-hover border border-border"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default Hero;
