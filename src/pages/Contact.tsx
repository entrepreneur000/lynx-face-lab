import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";

const Contact = () => {

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl page-transition">
      <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
        Get in Touch
      </h1>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <p className="text-sm text-muted-foreground">
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Messages are sent to asdss0582@gmail.com via Formspree.
        </p>
      </div>
    </div>
  );
};

export default Contact;
