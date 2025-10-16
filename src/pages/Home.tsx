import { useState, useRef } from "react";
import { Loader2, Download } from "lucide-react";
import { UploadArea } from "@/components/UploadArea";
import { GenderSelector } from "@/components/GenderSelector";
import { CanvasOverlay } from "@/components/CanvasOverlay";
import { QualityPanel } from "@/components/QualityPanel";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeFace, formatMetrics, calculateOverallScore, generateHarmonySummary } from "@/lib/faceAnalysis";

declare global {
  interface Window {
    faceapi: any;
  }
}

const Home = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [landmarks, setLandmarks] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const loadModels = async () => {
    if (modelsLoaded) return;
    
    try {
      toast({ title: "Loading AI models...", description: "This may take a moment" });
      
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      setModelsLoaded(true);
      toast({ title: "✓ Models loaded", description: "Ready to analyze!" });
    } catch (error) {
      console.error("Error loading models:", error);
      toast({ 
        title: "Error loading models", 
        description: "Please refresh the page and try again",
        variant: "destructive" 
      });
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !gender || !imageRef.current) {
      toast({ 
        title: "Missing requirements", 
        description: "Please upload an image and select gender",
        variant: "destructive" 
      });
      return;
    }

    await loadModels();
    if (!modelsLoaded) return;

    setAnalyzing(true);
    setResults(null);
    
    try {
      const img = imageRef.current;
      
      // Detect face and landmarks
      const detection = await window.faceapi
        .detectSingleFace(img, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        toast({ 
          title: "No face detected", 
          description: "Please ensure your face is clearly visible and well-lit",
          variant: "destructive" 
        });
        setAnalyzing(false);
        return;
      }

      setLandmarks(detection.landmarks);

      // Analyze face
      const { metrics, quality } = analyzeFace(detection.landmarks);
      const formattedMetrics = formatMetrics(metrics, gender);
      const overallScore = calculateOverallScore(metrics, gender);
      const harmonySummary = generateHarmonySummary(overallScore, metrics, gender);

      setResults({
        metrics: formattedMetrics,
        overallScore,
        harmonySummary,
        quality,
      });

      toast({ title: "✓ Analysis complete!", description: "Scroll down to view results" });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ 
        title: "Analysis failed", 
        description: "An error occurred during analysis",
        variant: "destructive" 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageUrl(url);
    setResults(null);
    setLandmarks(null);
  };

  const handleClear = () => {
    setImageFile(null);
    setImageUrl(null);
    setGender(null);
    setResults(null);
    setLandmarks(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl page-transition">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
          Lynxmax – AI Facial Symmetry & Looksmaxing Tool
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Analyze facial harmony, symmetry, and proportions using advanced AI. 
          All processing happens locally in your browser—your photos never leave your device.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="glass-card p-4 mb-8 border-primary/30">
        <p className="text-sm text-center">
          🔒 <strong>100% Private:</strong> All analysis runs locally in your browser. No images are uploaded or stored.
        </p>
      </div>

      {/* Upload Section */}
      <div className="space-y-6 mb-8">
        <UploadArea 
          onImageSelect={handleImageSelect} 
          imageUrl={imageUrl}
          onClear={handleClear}
        />

        {imageUrl && (
          <div className="relative glass-card p-4">
            <div className="relative inline-block">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Analysis target"
                className="max-w-full max-h-96 mx-auto rounded-lg"
                crossOrigin="anonymous"
              />
              {landmarks && imageRef.current && (
                <CanvasOverlay 
                  imageUrl={imageUrl} 
                  landmarks={landmarks}
                  imageElement={imageRef.current}
                />
              )}
            </div>
          </div>
        )}

        {imageUrl && (
          <>
            <GenderSelector selected={gender} onSelect={setGender} />

            <Button
              className="w-full btn-primary h-12 text-lg"
              onClick={handleAnalyze}
              disabled={analyzing || !gender}
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Face"
              )}
            </Button>
          </>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-8">
          <QualityPanel 
            roll={results.quality.roll}
            yaw={results.quality.yaw}
            ipd={results.quality.ipd}
          />

          <ResultsGrid
            metrics={results.metrics}
            overallScore={results.overallScore}
            harmonySummary={results.harmonySummary}
          />

          <div className="flex justify-center">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Report (Coming Soon)
            </Button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-16 glass-card p-6 border-yellow-500/30">
        <h3 className="font-semibold mb-2">⚠️ Important Disclaimer</h3>
        <p className="text-sm text-muted-foreground">
          This tool provides photo-based approximations using 2D facial landmarks. 
          Some cephalometric metrics are proxy estimates and should not be considered medical advice. 
          Results are for educational and entertainment purposes only. 
          True attractiveness is subjective and multifaceted.
        </p>
      </div>
    </div>
  );
};

export default Home;
