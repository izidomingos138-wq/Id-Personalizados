/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Check, 
  Copy, 
  QrCode, 
  RefreshCw, 
  Code2, 
  Sparkles, 
  CreditCard, 
  Bell, 
  Terminal, 
  ExternalLink,
  Cpu,
  Info,
  BadgeAlert,
  Smartphone
} from "lucide-react";

interface MercadoPagoSimulatorProps {
  onPaymentSuccess?: (amount: number, description: string) => void;
  defaultAmount?: number;
  defaultDescription?: string;
  isEmbedMode?: boolean;
}

export default function MercadoPagoSimulator({
  onPaymentSuccess,
  defaultAmount = 49.90,
  defaultDescription = "Pedido ID Personalizados",
  isEmbedMode = false
}: MercadoPagoSimulatorProps) {
  // Input states
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [description, setDescription] = useState<string>(defaultDescription);
  
  // API settings
  const [useProduction, setUseProduction] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>("APP_USR-7a71a172-mock-4672-9ea9-7261d76a9172");
  const [accessToken, setAccessToken] = useState<string>("APP_USR-8391294829301129-mock-7cba-493a38fae120");

  // Simulation state machine
  // 'idle' -> 'requesting' -> 'awaiting_payment' -> 'paying' -> 'paid'
  const [simState, setSimState] = useState<'idle' | 'requesting' | 'awaiting_payment' | 'paying' | 'paid'>('idle');
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [countDown, setCountDown] = useState<number>(600); // 10 minutes default
  const [activeCodeTab, setActiveCodeTab] = useState<'dart' | 'nodejs'>('dart');

  // Sync default values
  useEffect(() => {
    setAmount(defaultAmount);
  }, [defaultAmount]);

  useEffect(() => {
    setDescription(defaultDescription);
  }, [defaultDescription]);

  // Countdown timer for simulated Pix
  useEffect(() => {
    let interval: any = null;
    if (simState === 'awaiting_payment' && countDown > 0) {
      interval = setInterval(() => {
        setCountDown(prev => prev - 1);
      }, 1000);
    } else if (countDown === 0) {
      setSimState('idle');
    }
    return () => clearInterval(interval);
  }, [simState, countDown]);

  // Format countdown mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulated code generator
  const getCodeSnippet = () => {
    if (activeCodeTab === 'dart') {
      return `// Flutter/Dart integration using MercadoPago SDK
import 'package:mercado_pago_sdk/mercado_pago_sdk.dart';

final MercadoPago mp = MercadoPago(
  "${publicKey}"
);

Future<void> initPixPayment() async {
  try {
    final payment = await MercadoPago.instance.createPixPayment(
      amount: ${amount.toFixed(2)},
      description: "${description}",
      metadata: {
        "store": "ID Personalizados",
        "timestamp": "${new Date().toISOString()}",
      }
    );
    
    print("Pix ID: \${payment.id}");
    print("QR Code Base64: \${payment.qrCodeBase64}");
    print("Code Copia e Cola: \${payment.copiaCola}");
  } catch (e) {
    print("Erro ao gerar pagamento: \$e");
  }
}`;
    } else {
      return `// Node.js API endpoint proxying Mercado Pago Pix Request
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: '${accessToken.substring(0, 15)}...' 
});

const payment = new Payment(client);

export async function POST(req, res) {
  try {
    const response = await payment.create({
      body: {
        transaction_amount: ${amount.toFixed(2)},
        description: '${description}',
        payment_method_id: 'pix',
        payer: {
          email: 'payer_email@example.com',
          first_name: 'Simulado',
          last_name: 'Mercado Pago'
        }
      }
    });
    
    return res.json({
      id: response.id,
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
      status: response.status
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}`;
    }
  };

  // Run mock createPixPayment request
  const handleCreatePayment = () => {
    if (amount <= 0) {
      alert("Por favor, estipule um valor superior a R$ 0,00");
      return;
    }
    
    setSimState('requesting');
    
    // Simulate API network roundtrip latency
    setTimeout(() => {
      const generatedId = Math.floor(1000000000 + Math.random() * 9000000000);
      const generatedE2eId = "E" + Math.floor(100000000000000000 + Math.random() * 900000000000000000).toString();
      
      const simulatedResponse = {
        api_status: "success",
        id: generatedId,
        e2e_id: generatedE2eId,
        amount: amount,
        description: description,
        payment_method_id: "pix",
        status: "pending",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
        copia_cola: `000201010212268305840014br.gov.bcb.pix2561mp-pix-preprod@mercadopago.com5204000053039865405${amount.toFixed(2)}5802BR5917ID_PERSONALIZADOS6009Sao_Paulo62070503***6304` + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
      };
      
      setPaymentResult(simulatedResponse);
      setCountDown(600);
      setSimState('awaiting_payment');
    }, 1200);
  };

  // Trigger copy actions
  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Simulate payment webhook approval
  const handleSimulateWebhook = () => {
    setSimState('paying');
    
    // Simulate webhook resolution latency
    setTimeout(() => {
      setSimState('paid');
      if (paymentResult) {
        setPaymentResult((prev: any) => ({ ...prev, status: "approved" }));
      }
      
      // Notify parent callback
      if (onPaymentSuccess) {
        onPaymentSuccess(amount, description);
      }
    }, 1500);
  };

  // Reset simulator state
  const handleReset = () => {
    setSimState('idle');
    setPaymentResult(null);
  };

  return (
    <div className={`space-y-6 ${!isEmbedMode ? 'glass-card p-6 rounded-3xl relative border border-white/5' : ''}`}>
      
      {/* Decorative light tag */}
      {!isEmbedMode && (
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-white">SDK Mercado Pago Pix</h3>
              <p className="text-xs text-slate-500">Playground de integração da API Pix para o aplicativo mobile.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              useProduction ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-[#818cf8]/10 text-[#818cf8] border border-indigo-500/20'
            }`}>
              {useProduction ? 'Produção' : 'Sandbox (Testes)'}
            </span>
          </div>
        </div>
      )}

      {/* Grid divided into SDK configs, code, and live preview simulator */}
      <div className={`${isEmbedMode ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}`}>
        
        {/* Left Side: Parameters Form / Code Snippet */}
        <div className={`${isEmbedMode ? 'w-full' : 'lg:col-span-6 space-y-4'}`}>
          <div className="glass-card bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Parâmetros da Requisição
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1 md:col-span-1">
                <label className="text-slate-400 font-semibold block">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    disabled={simState !== 'idle'}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-semibold block">Descrição na Fatura</label>
                <input 
                  type="text" 
                  disabled={simState !== 'idle'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* SDK Keys (Simulated Credentials) - Hidden behind advanced settings button to avoid clutter */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Sandbox Mode</span>
                <input 
                  type="checkbox" 
                  checked={!useProduction} 
                  onChange={() => setUseProduction(!useProduction)} 
                  className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
              
              <div className="space-y-2 text-[10px] font-mono mt-2 text-slate-500 bg-slate-950 p-2.5 rounded-lg border border-white/5">
                <div>PUBLIC_KEY: <span className="text-indigo-400 font-semibold">{publicKey.substring(0, 18)}...</span></div>
                <div>ACCESS_TOKEN: <span className="text-indigo-400 font-semibold">{accessToken.substring(0, 22)}...</span></div>
              </div>
            </div>

            {/* Simulated Dart invocation code trigger button */}
            {simState === 'idle' && (
              <button
                onClick={handleCreatePayment}
                className="w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-xl transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Criar Pagamento Pix via SDK
              </button>
            )}

            {simState === 'requesting' && (
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 bg-slate-800 text-slate-500"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                MercadoPago.instance.createPixPayment()...
              </button>
            )}

            {simState !== 'idle' && simState !== 'requesting' && (
              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Gerar Novo Código Pix
              </button>
            )}
          </div>

          {/* Tabbed Code Snippet Block for Developer UI */}
          <div className="glass-card bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex border-b border-white/5 px-4 bg-slate-900/60 font-sans text-xs items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveCodeTab('dart')}
                  className={`py-3 font-semibold transition-all relative ${
                    activeCodeTab === 'dart' ? 'text-[#818cf8]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flutter / Dart
                  {activeCodeTab === 'dart' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#818cf8]" />}
                </button>
                <button
                  onClick={() => setActiveCodeTab('nodejs')}
                  className={`py-3 font-semibold transition-all relative ${
                    activeCodeTab === 'nodejs' ? 'text-[#818cf8]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Node.js Backend
                  {activeCodeTab === 'nodejs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#818cf8]" />}
                </button>
              </div>
              <button
                onClick={() => handleCopyText(getCodeSnippet(), activeCodeTab)}
                className="text-slate-505 text-slate-400 hover:text-white p-1 flex items-center gap-1 hover:bg-white/5 rounded transition-all shrink-0"
                title="Copiar código"
              >
                {copiedCode === activeCodeTab ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {copiedCode === activeCodeTab ? 'Copiado' : 'Copiar'}
                </span>
              </button>
            </div>

            <div className="p-4 overflow-x-auto max-h-56 scrollbar-thin">
              <pre className="text-[11px] font-mono text-indigo-305 text-indigo-200 leading-relaxed whitespace-pre font-medium">
                <code>{getCodeSnippet()}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Mobile Phone UI / simulated Pix billing checkout */}
        <div className={`${isEmbedMode ? 'w-full' : 'lg:col-span-6'} flex flex-col items-center justify-center`}>
          <div className="w-full max-w-sm glass-card border border-slate-800 rounded-[2.5rem] p-4 bg-slate-950/80 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[9/18]">
            
            {/* Native phone speaker and notch detail */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-900 border-b border-x border-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
              <span className="w-12 h-1 bg-slate-800 rounded-full block"></span>
            </div>

            {/* Inner Phone Screen */}
            <div className="bg-slate-900 rounded-[2rem] p-5 h-full flex flex-col justify-between overflow-y-auto pt-8 border border-white/5 space-y-4">
              
              {/* App status row */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono select-none">
                <span>02:38 UTC</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block"></span>
                  <span className="tracking-tighter">ID_PAY</span>
                </div>
              </div>

              {/* Main screen state dispatcher */}
              {simState === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-855 border-slate-800/60 flex items-center justify-center text-slate-650 text-indigo-400">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm tracking-tight">Checkout do Comprador</h5>
                    <p className="text-slate-450 text-xs text-slate-400 mt-1 px-4 leading-relaxed">
                      Aguardando chamada do SDK no dispositivo do cliente para gerar o Pix final.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-white/5 p-3 rounded-2xl w-full text-left space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Simular de imediato:</span>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-300">R$ {amount.toFixed(2).replace('.', ',')}</span>
                      <button
                        onClick={handleCreatePayment}
                        className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded text-[10px] leading-tight"
                      >
                        Chamar SDK
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {simState === 'requesting' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-slate-200 font-bold text-sm">Mercado Pago Pix</h5>
                    <p className="text-[#818cf8] text-xs font-mono font-bold mt-1.5 animate-pulse">
                      Invocando createPixPayment...
                    </p>
                    <p className="text-slate-500 text-[10px] mt-2 leading-relaxed px-4">
                      Seu app mobile está estabelecendo conexão segura com Mercado Pago para autenticação de credenciais.
                    </p>
                  </div>
                </div>
              )}

              {(simState === 'awaiting_payment' || simState === 'paying' || simState === 'paid') && paymentResult && (
                <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                  
                  {/* Status header with countdown */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block leading-none">Expirará em</span>
                      <span className="font-mono font-bold text-amber-400 block mt-1">{formatTimer(countDown)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block leading-none">Valor Cobrado</span>
                      <span className="font-mono font-bold text-[#818cf8] block mt-1">
                        R$ {amount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* QR Code Canvas Representation */}
                  <div className="flex flex-col items-center justify-center relative p-4 bg-white rounded-3xl shrink-0 group border-4 border-slate-950 shadow-inner">
                    {simState === 'paid' && (
                      <div className="absolute inset-0 bg-emerald-600/95 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center z-13 rounded-[1.2rem] animate-in fade-in duration-350">
                        <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                          <Check className="w-7 h-7" />
                        </div>
                        <h6 className="font-bold text-sm leading-tight">Pagamento Aprovado!</h6>
                        <p className="text-[10px] text-emerald-100 mt-1 lines-clamp-3">
                          Mercado Pago webhook confirmou o crédito da transação.
                        </p>
                        <span className="text-[8px] font-mono mt-3 text-emerald-200">Ref: {paymentResult.id}</span>
                      </div>
                    )}

                    {simState === 'paying' && (
                      <div className="absolute inset-0 bg-indigo-950/90 flex flex-col items-center justify-center text-white p-4 text-center z-13 rounded-[1.2rem] animate-in fade-in">
                        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                        <span className="text-xs font-mono font-bold animate-pulse text-indigo-200">Identificando Recebimento...</span>
                      </div>
                    )}

                    {/* Pure CSS Authentic Pix Logo and Grid Mockup QR Code */}
                    <div className="w-32 h-32 relative select-none">
                      {/* Styled decorative QR elements */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-slate-950 rounded-xs"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-slate-950 rounded-xs"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-slate-950 rounded-xs"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-slate-950 rounded-xs"></div>
                      
                      {/* Pix visual center target logo */}
                      <div className="absolute inset-8 bg-slate-950 p-1 rounded-lg flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                        PIX
                      </div>

                      {/* Mock matrix dots */}
                      <div className="absolute inset-2 grid grid-cols-5 gap-2 opacity-15">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className={`rounded-xs ${i % 3 === 0 ? 'bg-slate-950' : 'bg-transparent'}`} />
                        ))}
                      </div>
                      
                      <div className="absolute inset-2 border-2 border-dashed border-slate-400 rounded-lg"></div>
                    </div>

                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#00b19f] mt-2">
                      Fatura Mercado Pago
                    </span>
                  </div>

                  {/* Copy Pix Key Paste Block */}
                  <div className="space-y-2 select-none">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center block">Chave Copia e Cola Pix</p>
                    <div className="flex bg-slate-950 rounded-xl overflow-hidden border border-white/5 items-center justify-between pl-3 pr-1 py-1">
                      <span className="text-[10px] text-slate-500 font-mono truncate mr-2">
                        {paymentResult.copia_cola}
                      </span>
                      <button
                        onClick={() => handleCopyText(paymentResult.copia_cola, 'key')}
                        className="px-2.5 py-1.5 bg-slate-900 border border-white/5 hover:bg-[#818cf8]/15 hover:text-[#818cf8] text-slate-400 font-semibold rounded-lg text-[9px] transition-all flex items-center gap-1 shrink-0"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedKey ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {/* Manual testing control center webhook triggers */}
                  {simState === 'awaiting_payment' && (
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={handleSimulateWebhook}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-505/10 active:scale-95 transition-all"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Simular Webhook Pago
                      </button>
                    </div>
                  )}

                  {/* Paid and complete status banner */}
                  {simState === 'paid' && (
                    <div className="text-center">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">✓ Transação Finalizada</span>
                      <p className="text-[8px] text-slate-500 block mt-0.5">Dinheiro recebido na carteira Mercado Pago</p>
                    </div>
                  )}

                </div>
              )}

              {/* Secure seal footer */}
              <div className="text-[9px] text-slate-600 text-center select-none font-mono flex items-center justify-center gap-1">
                <span>🔒 Safe Sandbox Connection active</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Auxiliary explanation context alerts */}
      {!isEmbedMode && (
        <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 text-xs text-slate-400 flex gap-3 leading-relaxed">
          <Info className="w-5 h-5 text-[#818cf8] shrink-0 mt-0.5" />
          <p>
            O método <code className="font-mono text-indigo-300 font-bold">createPixPayment</code> do SDK do Mercado Pago gera um pagamento Pix seguro retornando um JSON contendo o código Pix copia e cola e a string binária do QR Code. O comprador paga no banco e o Mercado Pago notifica seu servidor através do webhook cadastrado, que altera automaticamente o status do pedido para <strong className="text-slate-200">Pago</strong> de forma instantânea.
          </p>
        </div>
      )}

    </div>
  );
}

// Sliders helper for icon
function Sliders(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="2" y1="14" x2="6" y2="14" />
      <line x1="10" y1="8" x2="14" y2="8" />
      <line x1="18" y1="16" x2="22" y2="16" />
    </svg>
  );
}
