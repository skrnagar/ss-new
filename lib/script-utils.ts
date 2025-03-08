
/**
 * Utility functions for optimizing script loading
 */
export const ScriptUtils = {
  /**
   * Loads a script dynamically with configurable options
   * 
   * @param src Script source URL
   * @param options Additional script configuration
   * @returns Promise that resolves when script loads
   */
  loadScript: (
    src: string, 
    options: {
      async?: boolean
      defer?: boolean
      id?: string
      onLoad?: () => void
      preconnect?: boolean
      preload?: boolean
    } = {}
  ): Promise<HTMLScriptElement> => {
    const { 
      async = true, 
      defer = true,
      id,
      onLoad,
      preconnect = false,
      preload = false
    } = options
    
    // Create preconnect link if needed
    if (preconnect && src.startsWith('https://')) {
      const domain = new URL(src).origin
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      document.head.appendChild(link)
    }
    
    // Create preload link if needed
    if (preload) {
      const preloadLink = document.createElement('link')
      preloadLink.rel = 'preload'
      preloadLink.as = 'script'
      preloadLink.href = src
      document.head.appendChild(preloadLink)
    }
    
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (id && document.getElementById(id)) {
        return resolve(document.getElementById(id) as HTMLScriptElement)
      }
      
      const script = document.createElement('script')
      script.src = src
      script.async = async
      script.defer = defer
      if (id) script.id = id
      
      script.onload = () => {
        if (onLoad) onLoad()
        resolve(script)
      }
      
      script.onerror = (error) => {
        document.head.removeChild(script)
        reject(error)
      }
      
      document.head.appendChild(script)
    })
  },
  
  /**
   * Loads a script only when the user interacts with the page
   * 
   * @param src Script source URL
   * @param options Additional script configuration
   */
  loadScriptOnInteraction: (src: string, options = {}): void => {
    const loadHandler = () => {
      ScriptUtils.loadScript(src, options)
      // Remove event listeners after loading
      ;['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.removeEventListener(event, loadHandler)
      })
    }
    
    // Add event listeners for user interaction
    ;['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      document.addEventListener(event, loadHandler, { once: true, passive: true })
    })
  }
}
