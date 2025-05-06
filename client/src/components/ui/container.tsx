import React from "react";
import { cn } from "../../lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-3xl mx-auto px-4 py-6 bg-transparent rounded-lg shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FormContainer({ children, className }: ContainerProps) {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Decorative stars in background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => {
          const top = `${Math.random() * 100}%`;
          const left = `${Math.random() * 100}%`;
          const size = `${0.5 + Math.random() * 1.5}px`;
          const opacity = `${0.3 + Math.random() * 0.7}`;
          
          return (
            <div 
              key={i} 
              className="absolute rounded-full bg-white" 
              style={{ 
                top, 
                left, 
                width: size, 
                height: size, 
                opacity 
              }}
            ></div>
          );
        })}
      </div>
      
      <Container className={cn("max-w-xl border border-white/10 bg-transparent backdrop-blur-sm shadow-xl", className)}>
        {children}
      </Container>
    </div>
  );
}
