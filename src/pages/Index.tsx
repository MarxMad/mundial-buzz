import Hero from "@/components/Hero";
import FanFeatures from "@/components/FanFeatures";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen pb-32 md:pb-0">
      <Hero />
      <FanFeatures />
      <Dashboard />
    </div>
  );
};

export default Index;
