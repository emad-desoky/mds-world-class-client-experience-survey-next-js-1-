import { Resend } from "resend";
import {
  SECTIONS,
  MODULES,
  MINI_BLOCK_QUESTIONS,
  RECOVERY_QUESTIONS,
} from "@/lib/constants";

let resendClient;

const getResendClient = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey && process.env.NODE_ENV === "production") {
      console.warn("RESEND_API_KEY is missing");
    }
    resendClient = new Resend(apiKey || "re_dummy_key");
  }
  return resendClient;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const responses = body.responses;

    if (!responses) {
      return Response.json({ error: "No responses provided" }, { status: 400 });
    }

    const resend = getResendClient();

    // Helper: Get color based on score
    const getScoreColor = (score) => {
      if (typeof score !== "number") return "#64748b";
      if (score >= 8) return "#10b981"; // Emerald
      if (score >= 5) return "#f59e0b"; // Amber
      return "#ef4444"; // Red
    };

    // Helper: Render answer values with professional styling
    const renderValue = (val) => {
      if (typeof val === "number") {
        const color = getScoreColor(val);
        return `
          <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 8px;">
            <tr>
              <td bgcolor="${color}" style="padding: 8px 24px; border-radius: 12px;">
                <span style="color: #ffffff; font-size: 20px; font-weight: 900; font-family: 'Inter', sans-serif;">${val}</span>
              </td>
              ${
                val <= 4
                  ? `
                <td style="padding-left: 16px;">
                  <span style="color: #ef4444; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-family: sans-serif; background: #fee2e2; padding: 6px 12px; border-radius: 6px; border: 1px solid #fecaca;">⚠️ Action Required</span>
                </td>
              `
                  : ""
              }
            </tr>
          </table>
        `;
      }
      if (Array.isArray(val)) {
        return `
          <div style="margin-top: 8px;">
            ${val.map((v) => `<span style="display: inline-block; background: #ffffff; color: #0f172a; padding: 6px 14px; border-radius: 8px; margin: 2px; font-size: 12px; font-weight: 700; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${v}</span>`).join("")}
          </div>
        `;
      }
      return `
        <div style="word-break: break-word; white-space: pre-wrap; color: #334155; font-size: 15px; line-height: 1.6; font-family: 'Inter', sans-serif; font-weight: 500; margin-top: 8px; background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
          ${val || '<span style="color: #cbd5e1; font-style: italic;">No response provided</span>'}
        </div>
      `;
    };

    // Build the full report structure with nested follow-ups
    const reportSections = [];

    // 1. Core Sections
    SECTIONS.forEach((section) => {
      const sectionData = { title: section.title, items: [] };
      const allQuestions = [
        ...section.questions,
        ...(section.deepDiveAdds || []),
      ];

      allQuestions.forEach((q) => {
        if (responses[q.id] !== undefined) {
          sectionData.items.push({
            question: q.text,
            answer: responses[q.id],
            isFollowUp: false,
          });

          // Check for nested recovery questions
          RECOVERY_QUESTIONS.forEach((rq) => {
            const recId = `${q.id}_${rq.id}`;
            if (responses[recId] !== undefined) {
              sectionData.items.push({
                question: rq.text,
                answer: responses[recId],
                isFollowUp: true,
              });
            }
          });
        }
      });
      if (sectionData.items.length > 0) reportSections.push(sectionData);
    });

    // 2. Modules
    MODULES.forEach((module) => {
      if (responses.SET_MODULES?.includes(module.id)) {
        const sectionData = { title: `${module.name} Module`, items: [] };
        const isPriority = responses.PRIORITY_MODULES?.includes(module.id);
        const questions = isPriority ? module.questions : MINI_BLOCK_QUESTIONS;

        questions.forEach((q) => {
          const key = `${module.id}_${q.id}`;
          if (responses[key] !== undefined) {
            sectionData.items.push({
              question: q.text,
              answer: responses[key],
              isFollowUp: false,
            });

            // Check for nested recovery questions in module
            RECOVERY_QUESTIONS.forEach((rq) => {
              const recId = `${key}_${rq.id}`;
              if (responses[recId] !== undefined) {
                sectionData.items.push({
                  question: rq.text,
                  answer: responses[recId],
                  isFollowUp: true,
                });
              }
            });
          }
        });
        if (sectionData.items.length > 0) reportSections.push(sectionData);
      }
    });

    // 3. Growth Systems
    if (responses.SET_GROWTH_SYSTEMS?.length > 0) {
      responses.SET_GROWTH_SYSTEMS.forEach((gs, index) => {
        const sectionData = { title: `Growth System: ${gs}`, items: [] };
        const gsQuestions = [
          {
            id: `GS_${index}_GS_SAT`,
            text: "Overall satisfaction with this system",
          },
          {
            id: `GS_${index}_GS_IMPACT`,
            text: "Impact on business outcomes so far",
          },
          {
            id: `GS_${index}_GS_GAP`,
            text: "What is the #1 gap in this system today?",
          },
        ];
        gsQuestions.forEach((q) => {
          if (responses[q.id] !== undefined) {
            sectionData.items.push({
              question: q.text,
              answer: responses[q.id],
              isFollowUp: false,
            });
          }
        });
        if (sectionData.items.length > 0) reportSections.push(sectionData);
      });
    }

    const html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>MDS Intelligence Report</title>
          <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; }
            .container { width: 100%; max-width: 680px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #020617; padding: 60px 40px; text-align: center; border-radius: 0 0 48px 48px; }
            .content { padding: 48px 40px; }
            .section-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 32px; padding: 40px; margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #10b981; margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; }
            .item-row { margin-bottom: 32px; }
            .item-row:last-child { margin-bottom: 0; }
            .question-text { font-size: 14px; font-weight: 800; color: #1e293b; line-height: 1.5; margin-bottom: 12px; }
            .follow-up-indicator { color: #ef4444; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-right: 8px; }
            .response-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
            @media only screen and (max-width: 600px) {
              .content { padding: 32px 20px !important; }
              .section-card { padding: 24px !important; }
              .header { padding: 48px 20px !important; }
            }
          </style>
        </head>
        <body>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8fafc">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table class="container" border="0" cellspacing="0" cellpadding="0" style="border-radius: 48px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
                  <!-- Header -->
                  <tr>
                    <td class="header">
                      <div style="color: #10b981; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6em; margin-bottom: 20px;">MDS Intelligence</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -0.05em; line-height: 1.1;">${responses.SET_COMPANY ? `${responses.SET_COMPANY} Feedback` : "Client Feedback Analysis"}</h1>
                      <div style="color: #64748b; font-size: 14px; font-weight: 500; margin-top: 16px;">Report Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td class="content">
                      <!-- Executive Context Bento -->
                      <div class="section-card" style="background: #020617; border: none; padding: 40px;">
                        <div class="section-title" style="color: #10b981; border-bottom: 1px solid rgba(255,255,255,0.1);">Executive Context</div>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="50%" style="padding-bottom: 32px; padding-right: 16px;">
                              <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Client Email</div>
                              <div style="font-size: 16px; font-weight: 700; color: #ffffff; word-break: break-all;">${responses.SET_EMAIL || "N/A"}</div>
                            </td>
                            <td width="50%" style="padding-bottom: 32px; padding-left: 16px;">
                              <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Company</div>
                              <div style="font-size: 16px; font-weight: 700; color: #ffffff;">${responses.SET_COMPANY || "N/A"}</div>
                            </td>
                          </tr>
                          <tr>
                            <td width="50%" style="padding-bottom: 32px; padding-right: 16px;">
                              <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Client Role</div>
                              <div style="font-size: 18px; font-weight: 700; color: #ffffff;">${responses.SET_ROLE || "N/A"}</div>
                            </td>
                            <td width="50%" style="padding-bottom: 32px; padding-left: 16px;">
                              <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Account Manager</div>
                              <div style="font-size: 18px; font-weight: 700; color: #ffffff;">${responses.SET_AM || "N/A"}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-right: 16px;">
                              <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Partnership Tenure</div>
                              <div style="font-size: 18px; font-weight: 700; color: #ffffff;">${responses.SET_TENURE || "N/A"} Months</div>
                            </td>
                            <td style="padding-left: 16px;">
                              <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Survey Mode</div>
                              <div style="font-size: 18px; font-weight: 700; color: #ffffff; text-transform: capitalize;">${responses.SET_MODE || "N/A"}</div>
                            </td>
                          </tr>
                        </table>
                        ${
                          responses.SET_CURRENCY
                            ? `
                          <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="33%">
                                  <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Spend</div>
                                  <div style="font-size: 14px; font-weight: 700; color: #ffffff;">${responses.SET_CURRENCY} ${responses.SET_SPEND}</div>
                                </td>
                                <td width="67%" style="padding-left: 16px;">
                                  <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Primary Market</div>
                                  <div style="font-size: 14px; font-weight: 700; color: #ffffff;">${responses.SET_MARKET || "N/A"}</div>
                                </td>
                              </tr>
                            </table>
                          </div>
                        `
                            : ""
                        }
                      </div>

                      <!-- Dynamic Intelligence Sections -->
                      ${reportSections
                        .map(
                          (section) => `
                        <div class="section-card">
                          <div class="section-title">${section.title}</div>
                          ${section.items
                            .map(
                              (item) => `
                            <div class="item-row" style="${item.isFollowUp ? "margin-left: 24px; border-left: 4px solid #fee2e2; padding-left: 20px;" : ""}">
                              <div class="question-text">
                                ${item.isFollowUp ? '<span class="follow-up-indicator">Follow-up</span>' : '<span style="color: #10b981; margin-right: 8px;">Q:</span>'}
                                ${item.question}
                              </div>
                              <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9;">
                                <div class="response-label">Client Response</div>
                                ${renderValue(item.answer)}
                              </div>
                            </div>
                          `,
                            )
                            .join("")}
                        </div>
                      `,
                        )
                        .join("")}

                      <!-- Follow-up Protocol Banner -->
                      <div style="background: ${responses.CL_FU === "Yes" ? "#ecfdf5" : "#fff1f2"}; border-radius: 32px; padding: 40px; text-align: center; border: 2px solid ${responses.CL_FU === "Yes" ? "#10b981" : "#f43f5e"}; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                        <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: ${responses.CL_FU === "Yes" ? "#065f46" : "#9f1239"}; margin-bottom: 16px;">Action Protocol</div>
                        <div style="font-size: 24px; font-weight: 900; color: ${responses.CL_FU === "Yes" ? "#064e3b" : "#881337"}; letter-spacing: -0.02em;">
                          ${responses.CL_FU === "Yes" ? `URGENT FOLLOW-UP — via ${responses.CL_CHAN || "WhatsApp"}` : "NO FOLLOW-UP REQUESTED"}
                        </div>
                        <div style="margin-top: 12px; font-size: 14px; color: ${responses.CL_FU === "Yes" ? "#065f46" : "#9f1239"}; font-weight: 500; opacity: 0.8;">
                          ${responses.CL_FU === "Yes" ? "Account Manager must initiate contact within 24 hours." : "Internal review and optimization only."}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 0 40px 60px 40px; text-align: center;">
                      <div style="font-size: 12px; color: #94a3b8; font-weight: 600; line-height: 1.8; letter-spacing: 0.02em;">
                        &copy; ${new Date().getFullYear()} MDS Healthcare Intelligence Division.<br/>
                        <span style="text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 0.1em; color: #cbd5e1;">Confidential Internal Document &bull; Do Not Forward</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "help@mds-healthcare.com",

      to: ["help@mds-healthcare.com"],
      subject: `[INTELLIGENCE] ${responses.SET_COMPANY ? `${responses.SET_COMPANY} | ` : ""}${responses.SET_ROLE || "New Response"} | AM: ${responses.SET_AM || "N/A"}`,
      html: html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return Response.json({ error: error.message || error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Server Error in /api/resend:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
