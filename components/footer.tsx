import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Safety Shaper</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting ESG and EHS professionals worldwide for knowledge sharing, career growth, and compliance
              management.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/knowledge" className="text-muted-foreground hover:text-primary">
                  Knowledge Center
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-primary">
                  Job Portal
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-muted-foreground hover:text-primary">
                  Groups
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="text-muted-foreground hover:text-primary">
                  Compliance Tools
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Safety Shaper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

