import React from "react";
import { formatDate } from "@/lib/utils";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { CyberButton } from "@/components/ui/cyber-button";
import { Post } from "@/types";

interface ScheduledContentProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  onGenerateNew: () => void;
  className?: string;
}

const ScheduledContent: React.FC<ScheduledContentProps> = ({
  posts,
  onEdit,
  onDelete,
  onGenerateNew,
  className,
}) => {
  // Helper function to determine if post is scheduled for today
  const isToday = (date: Date | undefined): boolean => {
    if (!date) return false;
    const today = new Date();
    const postDate = new Date(date);
    return (
      postDate.getDate() === today.getDate() &&
      postDate.getMonth() === today.getMonth() &&
      postDate.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to determine if post is scheduled for tomorrow
  const isTomorrow = (date: Date | undefined): boolean => {
    if (!date) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const postDate = new Date(date);
    return (
      postDate.getDate() === tomorrow.getDate() &&
      postDate.getMonth() === tomorrow.getMonth() &&
      postDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  return (
    <DashboardCard title="Scheduled Content" className={className}>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-matrixGreen/70 mb-4">No scheduled content yet</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border border-neonGreen/30 rounded bg-gradient-to-r from-transparent to-neonGreen/5 p-3 hover:border-neonGreen/60 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  {post.scheduledFor && (
                    <>
                      <span
                        className={`text-xs px-2 py-0.5 rounded mr-2 ${
                          isToday(post.scheduledFor)
                            ? "bg-neonGreen/20 text-neonGreen"
                            : isTomorrow(post.scheduledFor)
                            ? "bg-cyberBlue/20 text-cyberBlue"
                            : "bg-electricPurple/20 text-electricPurple"
                        }`}
                      >
                        {isToday(post.scheduledFor)
                          ? "Today"
                          : isTomorrow(post.scheduledFor)
                          ? "Tomorrow"
                          : formatDate(post.scheduledFor)}
                      </span>
                      <span className="text-xs text-techWhite/60">
                        {new Date(post.scheduledFor).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        UTC
                      </span>
                    </>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    className="text-matrixGreen hover:text-neonGreen transition-colors"
                    onClick={() => onEdit(post)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="text-matrixGreen hover:text-neonGreen transition-colors"
                    onClick={() => onDelete(post.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <p className="text-sm text-matrixGreen mb-2">{post.content}</p>
              <div className="flex items-center text-xs text-techWhite/60">
                {post.imageUrl && (
                  <span className="mr-3">
                    <i className="fas fa-image text-cyberBlue mr-1"></i> Image attached
                  </span>
                )}
                {post.aiGenerated && (
                  <span>
                    <i className="fas fa-robot text-electricPurple mr-1"></i> AI generated
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <CyberButton
          className="w-full"
          onClick={onGenerateNew}
          iconLeft={<i className="fas fa-plus"></i>}
        >
          GENERATE NEW CONTENT
        </CyberButton>
      </div>
    </DashboardCard>
  );
};

export default ScheduledContent;
