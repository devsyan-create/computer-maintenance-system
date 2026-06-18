import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Loader2, User } from 'lucide-react'
import { useAuthStore } from '@/store/useStore'
import { authAPI } from '@/services/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const AUTHORIZED_USERS = [
  { value: 'dler@syana.com', label: 'دلێر احمد' },
  { value: 'imad@syana.com', label: 'عماد احمد' },
  { value: 'azher@syana.com', label: 'ئاژێر صلاح' },
]

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('تکایە بەکارهێنەرێک هەڵبژێرە')
      return
    }
    
    if (!password) {
      toast.error('تکایە وشەی نهێنی بنووسە')
      return
    }

    setLoading(true)

    try {
      const data = await authAPI.login({ email, password })
      login(data.user, data.token)
      toast.success('بەخێربێیت!')
    } catch (err) {
      toast.error('وشەی نهێنی هەڵەیە')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div 
              className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <User className="w-10 h-10 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">چوونەژوورەوە</CardTitle>
              <p className="text-muted-foreground text-sm">
                سیستەمی بەڕێوەبردنی کەرەستە
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  بەکارهێنەر
                </label>
                <Select
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                >
                  <option value="">بەکارهێنەرێک هەڵبژێرە</option>
                  {AUTHORIZED_USERS.map((user) => (
                    <option key={user.value} value={user.value}>
                      {user.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  وشەی نهێنی
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="text-lg"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    چاوەڕێ بە...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    چوونەژوورەوە
                  </>
                )}
              </Button>
            </form>
            
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                صیانەی کۆمپیوتەر © {new Date().getFullYear()}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
