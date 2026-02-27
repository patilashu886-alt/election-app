import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="section-card w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">{t("notFound.title")}</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("notFound.description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
