import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, User } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { db } from "@/lib/db"
import moment from "moment"
import numeral from "numeral"
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { EmailOperations } from "@/components/email-operations"

async function getNewsletterForUser(
  username: Newsletter["username"],
  userId: User["id"]
) {
  return await db.newsletter.findFirst({
    where: {
      username,
      userId,
    },
    include: {
      user: true,
    },
  })
}

interface NewsletterSettingsPageProps {
  params: { newsletterId: string }
}

export default async function NewsletterSettingsPage({
  params,
}: NewsletterSettingsPageProps) {
  let user = await getCurrentUser()

  // if (!user) {
  //   redirect(authOptions?.pages?.signIn || "/login")
  // }

  user = {
    id: "9bfa9358-2ed9-4e66-963b-7900ee21a4b7",
    name: null,
    email: null,
    emailVerified: new Date("2022-01-01"),
    publicEmail: null,
    image: "https://placekitten.com/372/169",
    createdAt: new Date("2022-01-01"),
    updatedAt: new Date("2022-01-01"),
    url: "https://chase.com/",
    twitter: "isaacwaters",
  }

  const newsletter = await getNewsletterForUser(params.newsletterId, user.id)

  if (!newsletter) {
    notFound()
  }
  const newsletterId = newsletter.id

  const emails = await db.email.findMany({
    where: {
      newsletterId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          outboundEmails: {
            where: {
              status: OutboundEmailStatus.SENT,
            },
          },
        },
      },
    },
  })

  console.log(emails)
  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} emails`}
        text="Sent emails to this newsletter."
      />
      <div className="grid gap-6">
        <DashboardNav
          items={dashboardConfig.sidebarNav}
          basePath={"/dashboard/" + newsletter.username}
          currentPath={"/dashboard/" + newsletter.username + "/emails"}
        />
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 w-[180px] px-2 py-1">Email</TableHead>
              <TableHead className="h-8 w-[60px] px-2 py-1 text-center">
                Date
              </TableHead>
              <TableHead className="h-8 w-[60px] px-2 py-1 text-center">
                Sent To
              </TableHead>
              <TableHead className="h-8 w-[24px] px-1 py-1 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="py-1">{email.subject}</TableCell>
                <TableCell className="px-2 py-1 text-center">
                  {moment(email.createdAt).format("YYYY-MM-DD HH:mm")}
                </TableCell>
                <TableCell className="px-2 py-1 text-center">
                  {email._count.outboundEmails}
                </TableCell>
                <TableCell className="py-1 pl-2 pr-1 text-right">
                  <EmailOperations email={email} newsletter={newsletter} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}
