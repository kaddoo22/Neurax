import React, { useState } from "react";
import { CyberButton } from "@/components/ui/cyber-button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TwitterAccount {
  id: number;
  twitterUsername: string;
  accountName: string;
  profileImageUrl?: string;
  isDefault: boolean;
}

interface TwitterConnectionProps {
  isConnected: boolean;
  onConnect: () => void;
  username?: string;
  onSendTestTweet?: (accountId?: number) => void;
  twitterAccounts?: TwitterAccount[];
  isLoadingAccounts?: boolean;
  onSetDefaultAccount?: (id: number) => void;
  onDeleteAccount?: (id: number) => void;
  defaultAccount?: TwitterAccount;
}

const TwitterConnection: React.FC<TwitterConnectionProps> = ({
  isConnected,
  onConnect,
  username,
  onSendTestTweet,
  twitterAccounts = [],
  isLoadingAccounts = false,
  onSetDefaultAccount,
  onDeleteAccount,
  defaultAccount
}) => {
  const [accountToDelete, setAccountToDelete] = useState<TwitterAccount | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Preparazione per eliminare un account
  const prepareDeleteAccount = (account: TwitterAccount) => {
    setAccountToDelete(account);
    setIsDialogOpen(true);
  };

  // Conferma eliminazione account
  const confirmDeleteAccount = () => {
    if (accountToDelete && onDeleteAccount) {
      onDeleteAccount(accountToDelete.id);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <DashboardCard title="Twitter Integration" titleColor="cyberBlue">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#1DA1F2]/20 to-cyberBlue/20 flex items-center justify-center border border-[#1DA1F2]/40 mr-4">
            <i className="fab fa-twitter text-[#1DA1F2] text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-medium text-cyberBlue">
              {isConnected ? "Connected" : "Not Connected"}
            </h3>
            {isConnected && defaultAccount ? (
              <p className="text-sm text-matrixGreen/70">
                Default account: @{defaultAccount.twitterUsername}
              </p>
            ) : isConnected ? (
              <p className="text-sm text-matrixGreen/70">
                {twitterAccounts.length} accounts connected
              </p>
            ) : (
              <p className="text-sm text-matrixGreen/70">
                Connect your Twitter account to enable automatic posting
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <div>
            <div className="p-3 bg-spaceBlack border border-cyberBlue/30 rounded mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-matrixGreen">API Status</span>
                <span className="text-xs px-2 py-0.5 bg-neonGreen/20 text-neonGreen rounded">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-matrixGreen">API Rate Limit</span>
                <span className="text-xs px-2 py-0.5 bg-cyberBlue/20 text-cyberBlue rounded">
                  498/500
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-matrixGreen">Last Sync</span>
                <span className="text-xs text-matrixGreen/70">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Lista degli account Twitter collegati */}
            {twitterAccounts.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-matrixGreen mb-2">Connected Accounts</h3>
                <div className="space-y-3">
                  {twitterAccounts.map((account) => (
                    <div 
                      key={account.id} 
                      className={`p-3 border ${account.isDefault ? 'border-neonGreen/40 bg-neonGreen/5' : 'border-cyberBlue/30 bg-spaceBlack'} rounded flex items-center justify-between`}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1DA1F2]/20 to-cyberBlue/20 flex items-center justify-center border border-[#1DA1F2]/40 mr-3">
                          {account.profileImageUrl ? (
                            <img src={account.profileImageUrl} alt={account.twitterUsername} className="h-8 w-8 rounded-full" />
                          ) : (
                            <i className="fab fa-twitter text-[#1DA1F2]"></i>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-matrixGreen font-medium">@{account.twitterUsername}</p>
                          <p className="text-xs text-matrixGreen/70">{account.accountName}</p>
                          {account.isDefault && (
                            <span className="text-xs px-1.5 py-0.5 bg-neonGreen/20 text-neonGreen rounded inline-block mt-1">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!account.isDefault && onSetDefaultAccount && (
                          <CyberButton
                            variant="outline"
                            className="px-2 py-1 h-8 text-xs border-cyberBlue/30 hover:border-cyberBlue/60"
                            onClick={() => onSetDefaultAccount(account.id)}
                          >
                            <i className="fas fa-check-circle mr-1"></i> SET DEFAULT
                          </CyberButton>
                        )}
                        
                        {onDeleteAccount && twitterAccounts.length > 1 && (
                          <CyberButton
                            variant="outline"
                            className="px-2 py-1 h-8 text-xs border-red-500/30 hover:border-red-500/60"
                            onClick={() => prepareDeleteAccount(account)}
                          >
                            <i className="fas fa-trash mr-1"></i>
                          </CyberButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 mb-4">
              <CyberButton
                className="w-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 border-neonGreen/40"
                variant="outline"
                onClick={() => onSendTestTweet && onSendTestTweet()}
                iconLeft={<i className="fas fa-paper-plane"></i>}
                disabled={!onSendTestTweet || !defaultAccount}
              >
                INVIA TWEET DI TEST "CIAO MONDO"
              </CyberButton>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <CyberButton
                className="w-full"
                variant="outline"
                onClick={onConnect}
                iconLeft={<i className="fas fa-plus"></i>}
              >
                ADD ACCOUNT
              </CyberButton>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-3 bg-spaceBlack border border-red-500/30 rounded mb-4">
              <p className="text-xs text-red-400 mb-2">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Twitter account not connected
              </p>
              <p className="text-xs text-matrixGreen/70">
                Connecting to Twitter allows NeuraX to post content, analyze metrics, and grow your audience automatically.
              </p>
            </div>

            <CyberButton
              className="w-full"
              onClick={onConnect}
              iconLeft={<i className="fab fa-twitter"></i>}
            >
              CONNECT TWITTER
            </CyberButton>
          </div>
        )}
      </DashboardCard>

      {/* Dialog di conferma per eliminazione account */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-spaceBlack border border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription className="text-matrixGreen/70">
              Sei sicuro di voler rimuovere l'account Twitter @{accountToDelete?.twitterUsername}?
              <p className="mt-2 text-red-400/80">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Questa azione non può essere annullata.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-matrixGreen/30 text-matrixGreen">Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAccount} 
              className="bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TwitterConnection;
