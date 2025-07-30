import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Target, Zap, RefreshCw } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  useLinkedInSnapshot,
  useLinkedInChangelog,
} from "../../hooks/useLinkedInData";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { generateContentStrategy } from "../../services/openai";
import { useAppStore } from "../../stores/appStore";

interface ContentStrategy {
  type: string;
  description: string;
  examples: string[];
  engagementRate: number;
  frequency: string;
}

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedEngagement: number;
}

interface IdeaData {
  title: string;
  description: string;
  category: string;
  timestamp: number;
}

// Error Boundary Component
class CreationEngineErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CreationEngine Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We encountered an error while loading your content creation tools.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Reload Page
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Constants for better maintainability
const GENERATION_DELAY = 1500;
const SESSION_STORAGE_KEY = "ideaContent";
const FALLBACK_IDEAS: ContentIdea[] = [
  {
    id: "fallback-1",
    title: "Quick Professional Tip",
    description: "Share a valuable professional insight or tip",
    category: "Educational",
    difficulty: "Easy",
    estimatedEngagement: 75,
  },
  {
    id: "fallback-2",
    title: "Industry Question",
    description: "Ask an engaging question about your industry",
    category: "Engagement",
    difficulty: "Easy",
    estimatedEngagement: 80,
  },
];

const CreationEngineContent = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string>("");
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const { setCurrentModule } = useAppStore();
  const { data: snapshotData, isLoading: snapshotLoading } =
    useLinkedInSnapshot();
  const { data: changelogData, isLoading: changelogLoading } =
    useLinkedInChangelog();

  // Analyze user's posting patterns
  const analysis = useMemo(() => {
    if (!snapshotData || !changelogData) return null;

    try {
      const posts =
        changelogData.elements?.filter((e) => e.resourceName === "ugcPosts") ||
        [];
      const likes =
        changelogData.elements?.filter(
          (e) => e.resourceName === "socialActions/likes"
        ) || [];
      const comments =
        changelogData.elements?.filter(
          (e) => e.resourceName === "socialActions/comments"
        ) || [];

      // Analyze content types from posts
      const contentTypes = {
        text: 0,
        image: 0,
        video: 0,
        carousel: 0,
        poll: 0,
      };

      posts.forEach((post) => {
        try {
          const specificContent =
            post.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
          const media = specificContent?.media;

          if (media && media.length > 0) {
            if (media.length > 1) {
              contentTypes.carousel++;
            } else {
              contentTypes.image++;
            }
          } else {
            contentTypes.text++;
          }
        } catch (error) {
          console.warn("Error processing post content type:", error);
          contentTypes.text++; // Default to text if processing fails
        }
      });

      // Calculate engagement rates
      const totalEngagement = likes.length + comments.length;
      const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;

      // Analyze best performing times
      const postTimes = posts.map((p) => {
        try {
          return new Date(p.capturedAt).getHours();
        } catch (error) {
          console.warn("Error parsing post time:", error);
          return 9; // Default to 9 AM
        }
      });
      
      const hourCounts = postTimes.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const optimalHour =
        Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "9";

      const bestPerformingTypeEntry = Object.entries(contentTypes).sort(([, a], [, b]) => b - a)[0];
      const bestPerformingType = bestPerformingTypeEntry?.[0] || "text";

      return {
        totalPosts: posts.length,
        avgEngagement: Number(avgEngagement.toFixed(1)),
        contentTypes,
        optimalHour: parseInt(optimalHour),
        bestPerformingType: String(bestPerformingType), // Ensure it's always a string
      };
    } catch (error) {
      console.error("Error in analysis calculation:", error);
      // Return safe default values
      return {
        totalPosts: 0,
        avgEngagement: 0,
        contentTypes: { text: 0, image: 0, video: 0, carousel: 0, poll: 0 },
        optimalHour: 9,
        bestPerformingType: "text",
      };
    }
  }, [snapshotData, changelogData]);

  // Content strategies based on analysis
  const strategies: ContentStrategy[] = [
    {
      type: "Thought Leadership",
      description: "Share industry insights and personal perspectives",
      examples: [
        "Industry trend analysis",
        "Lessons learned",
        "Controversial opinions",
      ],
      engagementRate: 8.5,
      frequency: "2-3x per week",
    },
    {
      type: "Personal Stories",
      description: "Share authentic personal experiences",
      examples: ["Career journey", "Failure stories", "Behind-the-scenes"],
      engagementRate: 9.2,
      frequency: "1-2x per week",
    },
    {
      type: "Educational Content",
      description: "Teach valuable skills and knowledge",
      examples: ["How-to guides", "Industry tips", "Tool recommendations"],
      engagementRate: 7.8,
      frequency: "3-4x per week",
    },
    {
      type: "Engagement Posts",
      description: "Posts designed to spark conversation",
      examples: ["Questions", "Polls", "Controversial takes"],
      engagementRate: 9.8,
      frequency: "1x per week",
    },
  ];

  const generateContentIdeas = async () => {
    setIsGenerating(true);

    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, GENERATION_DELAY));

      // Two idea sets for variety (reduced from 3 for better performance)
      const ideaSets = [
        [
          {
            id: "1",
            title: "The Hidden Cost of Remote Work",
            description:
              "Share your personal experience with remote work challenges and solutions",
            category: "Personal Story",
            difficulty: "Easy",
            estimatedEngagement: 85,
          },
          {
            id: "2",
            title: "5 Tools That Changed My Productivity",
            description:
              "Create a carousel post showcasing your favorite productivity tools",
            category: "Educational",
            difficulty: "Medium",
            estimatedEngagement: 92,
          },
          {
            id: "3",
            title: "What Would You Do? Career Dilemma",
            description:
              "Present a career scenario and ask for community advice",
            category: "Engagement",
            difficulty: "Easy",
            estimatedEngagement: 78,
          },
          {
            id: "4",
            title: "Industry Prediction: AI in 2024",
            description:
              "Share your predictions about AI trends in your industry",
            category: "Thought Leadership",
            difficulty: "Hard",
            estimatedEngagement: 95,
          },
        ],
        [
          {
            id: "5",
            title: "The Power of Networking in 2024",
            description:
              "Share how networking has evolved and your best networking tips",
            category: "Professional Tips",
            difficulty: "Medium",
            estimatedEngagement: 88,
          },
          {
            id: "6",
            title: "My Biggest Career Mistake (And What I Learned)",
            description:
              "Share a personal failure story and the valuable lessons learned",
            category: "Personal Story",
            difficulty: "Easy",
            estimatedEngagement: 91,
          },
          {
            id: "7",
            title: "3 Skills That Will Be Essential in 2025",
            description:
              "Predict which skills will be most valuable in the coming year",
            category: "Thought Leadership",
            difficulty: "Medium",
            estimatedEngagement: 87,
          },
          {
            id: "8",
            title: "Poll: What's Your Biggest Work Challenge?",
            description:
              "Create an engaging poll to understand your audience better",
            category: "Engagement",
            difficulty: "Easy",
            estimatedEngagement: 82,
          },
        ],
      ];

      // Randomly select one of the idea sets
      const randomIndex = Math.floor(Math.random() * ideaSets.length);
      const ideas = ideaSets[randomIndex];

      setGeneratedIdeas(ideas);
      
      // Scroll to bottom after ideas are generated
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 200);
    } catch (error) {
      console.error("Failed to generate content ideas:", error);
      // Fallback ideas
      setGeneratedIdeas(FALLBACK_IDEAS);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIStrategy = async () => {
    if (!snapshotData || !changelogData) return;

    setIsGeneratingStrategy(true);
    try {
      const posts = changelogData.elements?.filter(e => e.resourceName === "ugcPosts") || [];
      const cleanPosts = posts.slice(0, 3).map(post => {
        try {
          // Safely extract text content, ensuring we never pass objects to React
          const shareContent = post.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
          const shareCommentary = shareContent?.shareCommentary;
          
          let text = "Post content";
          
          // Handle different possible structures of shareCommentary
          if (typeof shareCommentary === 'string') {
            text = shareCommentary.substring(0, 200);
          } else if (shareCommentary && typeof shareCommentary === 'object') {
            // If shareCommentary is an object, try to extract text
            if (shareCommentary.text && typeof shareCommentary.text === 'string') {
              text = shareCommentary.text.substring(0, 200);
            } else if (shareCommentary.localized) {
              // Handle localized content
              const localized = shareCommentary.localized;
              if (typeof localized === 'object') {
                // Get the first available localized text
                const firstKey = Object.keys(localized)[0];
                if (firstKey && typeof localized[firstKey] === 'string') {
                  text = localized[firstKey].substring(0, 200);
                } else if (firstKey && localized[firstKey] && typeof localized[firstKey].rawText === 'string') {
                  text = localized[firstKey].rawText.substring(0, 200);
                }
              }
            }
          }
          
          return {
            text: text || "Post content",
            timestamp: post.capturedAt || Date.now()
          };
        } catch (error) {
          console.warn("Error processing post for AI strategy:", error);
          return {
            text: "Post content",
            timestamp: post.capturedAt || Date.now()
          };
        }
      });

      const strategy = await generateContentStrategy(cleanPosts, analysis || {});
      setAiStrategy(strategy);
    } catch (error) {
      console.error("AI Strategy Error:", error);
      setAiStrategy("Strategy generation failed. Please try again.");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleUseIdea = (idea: ContentIdea) => {
    try {
      // Store the idea content in sessionStorage for PostGen to use
      const ideaData: IdeaData = {
        title: idea.title,
        description: idea.description,
        category: idea.category,
        timestamp: Date.now(),
      };

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(ideaData));

      // Navigate to PostGen
      setCurrentModule("postgen");
    } catch (error) {
      console.error("Failed to handle idea selection:", error);
      // Fallback: try direct navigation without sessionStorage
      setCurrentModule("postgen");
    }
  };

  if (snapshotLoading || changelogLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Creation Engine</h2>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={generateAIStrategy}
            disabled={isGeneratingStrategy}
          >
            <Zap size={16} className="mr-2" />
            {isGeneratingStrategy ? "Analyzing..." : "AI Strategy"}
          </Button>
          <Button
            variant="primary"
            onClick={generateContentIdeas}
            disabled={isGenerating}
          >
            <Lightbulb size={16} className="mr-2" />
            {isGenerating ? "Generating..." : "Generate Ideas"}
          </Button>
        </div>
      </div>

      {/* AI Strategy Section */}
      {aiStrategy && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="mr-2 text-purple-500" size={20} />
            AI Content Strategy
          </h3>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-gray-900 dark:text-gray-100">
              {aiStrategy}
            </div>
          </div>
        </Card>
      )}

      {/* Performance Analysis */}
      {analysis && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Content Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {String(analysis.totalPosts || 0)}
              </div>
              <div className="text-sm text-gray-500">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {String(analysis.avgEngagement || 0)}
              </div>
              <div className="text-sm text-gray-500">Avg Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {String(analysis.optimalHour || 9)}:00
              </div>
              <div className="text-sm text-gray-500">Optimal Hour</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Recommendation:</strong> Your{" "}
              {String(analysis.bestPerformingType || "text")} posts perform best. Consider posting
              around {String(analysis.optimalHour || 9)}:00 for maximum engagement.
            </p>
          </div>
        </Card>
      )}

      {/* Content Strategies */}
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recommended Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStrategy === strategy.type
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedStrategy(strategy.type)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{strategy.type}</h4>
                <div className="flex items-center space-x-1">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-sm text-green-600">
                    {strategy.engagementRate}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {strategy.description}
              </p>
              <div className="space-y-1">
                {strategy.examples.map((example, i) => (
                  <div key={i} className="text-xs text-gray-500">
                    • {example}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-blue-600">
                Frequency: {strategy.frequency}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Generated Ideas */}
      {generatedIdeas.length > 0 && (
        <Card variant="glass" className="p-6" data-ideas-section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Content Ideas</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={generateContentIdeas}
              disabled={isGenerating}
            >
              <RefreshCw size={14} className="mr-1" />
              {isGenerating ? "Generating..." : "Refresh"}
            </Button>
          </div>
          <div className="space-y-4">
            {generatedIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {idea.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          idea.difficulty === "Easy"
                            ? "bg-green-100 text-green-800"
                            : idea.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {idea.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {idea.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>Category: {idea.category}</span>
                      <span>Est. Engagement: {idea.estimatedEngagement}%</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUseIdea(idea)}
                    >
                      <Zap size={14} className="mr-1" />
                      Use Idea
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Target size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export const CreationEngine = () => {
  return (
    <CreationEngineErrorBoundary>
      <CreationEngineContent />
    </CreationEngineErrorBoundary>
  );
};
