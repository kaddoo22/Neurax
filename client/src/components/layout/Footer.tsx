import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neonGreen/20 p-4 md:p-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-xs text-techWhite/50 mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} NeuraX - AI-Powered Social Media Manager</p>
          <p className="mt-1">
            Version 1.0.3 | <span className="text-neonGreen">SYSTEM ONLINE</span>
          </p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-matrixGreen hover:text-neonGreen transition-colors text-sm">
            <i className="fas fa-shield-alt"></i>
          </a>
          <a href="#" className="text-matrixGreen hover:text-neonGreen transition-colors text-sm">
            <i className="fas fa-question-circle"></i>
          </a>
          <a href="#" className="text-matrixGreen hover:text-neonGreen transition-colors text-sm">
            <i className="fas fa-code"></i>
          </a>
          <a href="#" className="text-matrixGreen hover:text-neonGreen transition-colors text-sm">
            <i className="fas fa-bug"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
