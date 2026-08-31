"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CreateInquiryInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  destination?: string;
  type?: string;
}

// Disallowed fake/dummy email domains and gibberish patterns
const BLOCKED_DOMAINS = [
  "ads.com",
  "fake.com",
  "test.com",
  "asdf.com",
  "tempmail.com",
  "mailinator.com",
  "example.com",
  "dispostable.com",
  "guerrillamail.com",
  "10minutemail.com",
  "trashmail.com",
];

export async function createInquiryAction(input: CreateInquiryInput) {
  try {
    const { name, email, phone, message, destination, type } = input;

    const trimmedName = name?.trim() || "";
    const trimmedEmail = email?.trim().toLowerCase() || "";
    const trimmedPhone = phone?.trim() || "";
    const trimmedMessage = message?.trim() || "";

    // 1. Name validation
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Please enter your full name." };
    }
    if (/^(.)\1{3,}$/i.test(trimmedName)) {
      return { success: false, error: "Please enter a valid full name." };
    }

    // 2. Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address (e.g. name@gmail.com)." };
    }

    const domain = trimmedEmail.split("@")[1];
    if (BLOCKED_DOMAINS.includes(domain)) {
      return { success: false, error: "Please provide a genuine, active email address so our team can reach you." };
    }

    const emailUser = trimmedEmail.split("@")[0];
    if (/^(.)\1{4,}$/i.test(emailUser) || emailUser.length < 2) {
      return { success: false, error: "The email address appears invalid. Please check and try again." };
    }

    // 3. Phone validation
    if (trimmedPhone) {
      const cleanDigits = trimmedPhone.replace(/[^0-9]/g, "");
      if (cleanDigits.length < 6 || cleanDigits.length > 15) {
        return { success: false, error: "Please enter a valid contact phone number (6-15 digits)." };
      }
    }

    // 4. Message validation
    if (!trimmedMessage || trimmedMessage.length < 5) {
      return { success: false, error: "Please tell us a little more about your dream trip (minimum 5 characters)." };
    }

    // Embed phone into message to remain 100% resilient across Prisma Client generation states
    const finalMessage = trimmedPhone
      ? `[Contact Phone: ${trimmedPhone}]\n\n${trimmedMessage}`
      : trimmedMessage;

    const dataPayload: any = {
      name: trimmedName,
      email: trimmedEmail,
      message: finalMessage,
      destination: destination?.trim() || null,
      type: type || "TRIP_INQUIRY",
      status: "NEW",
    };

    const inquiry = await prisma.inquiry.create({
      data: dataPayload,
    });

    try {
      revalidatePath("/");
      revalidatePath("/[locale]");
      revalidatePath("/[locale]/admin");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      inquiry: {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: trimmedPhone || null,
        message: trimmedMessage,
        destination: inquiry.destination,
        reply: (inquiry as any).reply || null,
        status: inquiry.status,
        createdAt: inquiry.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Failed to create inquiry:", error);
    return { success: false, error: error?.message || "Failed to submit inquiry. Please try again." };
  }
}

/** Fetch live user inquiries by stored IDs */
export async function getInquiriesByIdsAction(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return { success: true, inquiries: [] };

    const cleanIds = ids.filter((id) => typeof id === "string" && id.length > 0).slice(0, 20);
    const inquiries = await prisma.inquiry.findMany({
      where: { id: { in: cleanIds } },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      inquiries: inquiries.map((inq) => {
        const phoneMatch = inq.message.match(/^\[Contact Phone:\s*([^\]]+)\]\n\n?/);
        const extractedPhone = phoneMatch
          ? phoneMatch[1].trim()
          : ((inq as any).phone || null);
        const cleanMessage = phoneMatch
          ? inq.message.replace(/^\[Contact Phone:\s*[^\]]+\]\n\n?/, "")
          : inq.message;

        return {
          id: inq.id,
          name: inq.name,
          email: inq.email,
          phone: extractedPhone,
          message: cleanMessage,
          destination: inq.destination,
          reply: (inq as any).reply || null,
          status: inq.status,
          createdAt: inq.createdAt.toISOString(),
        };
      }),
    };
  } catch (error: any) {
    console.error("Failed to fetch inquiries by IDs:", error);
    return { success: false, inquiries: [], error: error?.message };
  }
}

export async function deleteInquiryAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: "Inquiry ID is required." };
    }

    await prisma.inquiry.delete({
      where: { id },
    });

    try {
      revalidatePath("/");
      revalidatePath("/[locale]");
      revalidatePath("/[locale]/admin");
    } catch {
      // Ignore outside request context
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete inquiry:", error);
    return { success: false, error: error?.message || "Failed to delete inquiry." };
  }
}
