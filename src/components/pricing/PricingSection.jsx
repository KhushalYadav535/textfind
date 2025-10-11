import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react'

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-slate-500 to-slate-600',
      features: [
        '100 uploads per month',
        'Basic OCR accuracy',
        'Text extraction only',
        '5MB file size limit',
        'Community support'
      ],
      limitations: [
        'No batch processing',
        'No API access',
        'No advanced features'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 19, annual: 190 },
      description: 'For professionals and small teams',
      icon: <Star className="w-6 h-6" />,
      color: 'from-cyan-500 to-cyan-600',
      features: [
        '1,000 uploads per month',
        'High accuracy OCR',
        'Batch processing',
        '50MB file size limit',
        'Multiple languages',
        'API access',
        'Priority support',
        'Export to multiple formats'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, annual: 990 },
      description: 'For large organizations',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
      features: [
        'Unlimited uploads',
        'Premium OCR accuracy',
        'Advanced batch processing',
        '1GB file size limit',
        '100+ languages',
        'Full API access',
        'Custom integrations',
        '24/7 dedicated support',
        'SSO & team management',
        'Custom workflows',
        'Advanced analytics'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const PricingCard = ({ plan, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group p-8 rounded-3xl border-2 transition-all duration-300 ${
        plan.popular
          ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 to-amber-500/5'
          : 'border-white/10 bg-slate-900/30 hover:border-white/20'
      } backdrop-blur-sm`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full text-white text-sm font-semibold">
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg mb-4`}>
          {plan.icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-slate-400 mb-4">{plan.description}</p>
        <div className="mb-4">
          <span className="text-4xl font-bold text-white">
            ${isAnnual ? plan.price.annual : plan.price.monthly}
          </span>
          <span className="text-slate-400 ml-2">
            /{isAnnual ? 'year' : 'month'}
          </span>
        </div>
        {isAnnual && plan.price.monthly > 0 && (
          <p className="text-green-400 text-sm">
            Save ${(plan.price.monthly * 12) - plan.price.annual}/year
          </p>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">{feature}</span>
          </div>
        ))}
        {plan.limitations.map((limitation, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full border border-slate-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-500">{limitation}</span>
          </div>
        ))}
      </div>

      <button
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
          plan.popular
            ? 'bg-gradient-to-r from-cyan-500 to-amber-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25'
            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-white/20'
        }`}
      >
        {plan.cta}
      </button>
    </motion.div>
  )

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-amber-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium backdrop-blur-sm">
              💎 Simple, Transparent Pricing
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Choose Your <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">Perfect Plan</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-8"
          >
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? 'bg-gradient-to-r from-cyan-500 to-amber-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save 17%
              </span>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 backdrop-blur-sm">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 text-sm">
              14-day free trial • No credit card required • Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
