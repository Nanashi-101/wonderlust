import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { SITE_URL } from "../config";

const styles = {
  body: {
    backgroundColor: "#f5f5f5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "40px 40px 32px",
  },
  brand: {
    color: "#171717",
    fontSize: "20px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase" as const,
  },
  accent: {
    backgroundColor: "#06b6d4",
    border: "none",
    height: "2px",
    margin: "12px 0 28px",
    width: "48px",
  },
  divider: {
    borderColor: "#e5e5e5",
    margin: "32px 0 20px",
  },
  footer: {
    color: "#a3a3a3",
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
  },
  footerLink: {
    color: "#0891b2",
    textDecoration: "none",
  },
};

interface EmailLayoutProps {
  /** Inbox preview line. Kept distinct from the subject so it adds information. */
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.brand}>Wonderlust</Text>
            <Hr style={styles.accent} />
          </Section>

          {children}

          <Hr style={styles.divider} />
          <Text style={styles.footer}>
            Wonderlust &middot;{" "}
            <Link href={SITE_URL} style={styles.footerLink}>
              wanderlusttravels.fyi
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const text = {
  heading: {
    color: "#171717",
    fontSize: "22px",
    fontWeight: 600,
    lineHeight: "30px",
    margin: "0 0 16px",
  },
  paragraph: {
    color: "#525252",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  label: {
    color: "#a3a3a3",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    margin: "0 0 4px",
    textTransform: "uppercase" as const,
  },
  value: {
    color: "#171717",
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0 0 18px",
    whiteSpace: "pre-wrap" as const,
  },
  quote: {
    backgroundColor: "#fafafa",
    borderLeft: "3px solid #06b6d4",
    color: "#404040",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 24px",
    padding: "14px 18px",
    whiteSpace: "pre-wrap" as const,
  },
  button: {
    backgroundColor: "#06b6d4",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 28px",
    textDecoration: "none",
  },
};

/** Labelled detail row used by the internal alert template. */
export function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Text style={text.label}>{label}</Text>
      <Text style={text.value}>{children}</Text>
    </>
  );
}
