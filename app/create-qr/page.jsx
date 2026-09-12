'use strict';

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode, ArrowLeft, ArrowRight, Check, Link2, Type, Phone,
  MessageSquare, Mail, Wifi, CreditCard, MapPin, Upload, DollarSign, Sparkles
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import qrService from '../../services/qrService';
import { useToast } from '../../contexts/ToastContext';

const QR_TYPES = [
  { id: 'url', name: 'URL / Site Web', icon: Link2, desc: 'Redirigez vers n\'importe quel lien web.' },
  { id: 'text', name: 'Texte Simple', icon: Type, desc: 'Affichez un message texte brut.' },
  { id: 'phone', name: 'Téléphone', icon: Phone, desc: 'Lancez un appel téléphonique.' },
  { id: 'sms', name: 'SMS', icon: MessageSquare, desc: 'Préparez un message SMS.' },
  { id: 'email', name: 'Email', icon: Mail, desc: 'Générez un mail pré-rempli.' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, desc: 'Envoyez un message WhatsApp.' },
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi, desc: 'Connectez vos visiteurs au Wi-Fi.' },
  { id: 'vcard', name: 'vCard (Contact)', icon: CreditCard, desc: 'Partagez vos coordonnées de contact.' },
  { id: 'location', name: 'Localisation GPS', icon: MapPin, desc: 'Affichez des coordonnées GPS.' },
  { id: 'pdf', name: 'Document PDF', icon: Upload, desc: 'Partagez un fichier PDF.' },
  { id: 'image', name: 'Image', icon: Upload, desc: 'Affichez une image.' },
  { id: 'video', name: 'Vidéo', icon: Upload, desc: 'Redirigez vers une vidéo.' },
  { id: 'download', name: 'Téléchargement', icon: Link2, desc: 'Lien direct de téléchargement.' },
];

export default function CreateQrPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('url');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Style customization
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size, setSize] = useState(300);
  const [logoFile, setLogoFile] = useState(null);

  // Form Fields states
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [vFirstName, setVFirstName] = useState('');
  const [vLastName, setVLastName] = useState('');
  const [vOrg, setVOrg] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vWebsite, setVWebsite] = useState('');
  const [vAddress, setVAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [fileUrl, setFileUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('error', 'Veuillez donner un nom à votre QR Code.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', selectedType);
      formData.append('foregroundColor', fgColor);
      formData.append('backgroundColor', bgColor);
      formData.append('size', size);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      switch (selectedType) {
        case 'url':
        case 'download':
          formData.append('url', url);
          break;
        case 'text':
          formData.append('text', text);
          break;
        case 'phone':
          formData.append('phone', phone);
          break;
        case 'sms':
          formData.append('phone', phone);
          formData.append('message', message);
          break;
        case 'email':
          formData.append('email', email);
          formData.append('subject', subject);
          formData.append('body', bodyText);
          break;
        case 'whatsapp':
          formData.append('phone', phone);
          formData.append('message', message);
          break;
        case 'wifi':
          formData.append('ssid', wifiSsid);
          formData.append('password', wifiPassword);
          formData.append('security', wifiSecurity);
          break;
        case 'vcard':
          formData.append('firstname', vFirstName);
          formData.append('lastname', vLastName);
          formData.append('organization', vOrg);
          formData.append('title', vTitle);
          formData.append('email', vEmail);
          formData.append('phone', vPhone);
          formData.append('website', vWebsite);
          formData.append('address', vAddress);
          break;
        case 'location':
          formData.append('latitude', lat);
          formData.append('longitude', lng);
          break;
        case 'pdf':
        case 'image':
        case 'video':
          if (uploadFile) {
            formData.append('file', uploadFile);
          } else {
            formData.append('url', fileUrl);
          }
          break;
        default:
          break;
      }

      const res = await qrService.createQrCode(formData);
      if (res.success) {
        showToast('success', 'QR Code créé avec succès !');
        router.push('/my-qrcodes');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de la création du QR Code.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedType) {
      showToast('error', 'Veuillez sélectionner un type de QR Code.');
      return;
    }
    if (step === 2 && !name.trim()) {
      showToast('error', 'Veuillez donner un nom à votre QR Code.');
      return;
    }
    setStep(s => Math.min(5, s + 1));
  };

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const stepsLabel = ['Type de QR', 'Données', 'Style', 'Prévisualiser', 'Création'];

  return (
    <DashboardLayout breadcrumb={[{ label: 'Créer un QR Code' }]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Créer un QR Code"
          description="Générez un QR Code dynamique hautement personnalisable en quelques étapes."
        />

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-white/5 rounded-2xl">
          {stepsLabel.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted ? 'bg-indigo-600 text-white' : isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-950 text-slate-600'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`text-xs font-semibold hidden md:inline ${isActive ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                {idx < stepsLabel.length - 1 && <div className="h-0.5 w-6 bg-slate-800 hidden md:block" />}
              </div>
            );
          })}
        </div>

        {/* Main Content Card */}
        <Card className="p-6">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">1. Sélectionnez le type de contenu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {QR_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow shadow-indigo-600/10'
                          : 'border-white/5 bg-slate-950/40 text-slate-400 hover:bg-slate-950/80 hover:text-white'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider">{type.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Configure Inputs */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Renseignez les informations</h3>
              <div className="space-y-4">
                <Input
                  label="Nom du QR Code"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Menu principal, WiFi VIP, etc."
                  required
                />

                {selectedType === 'url' && (
                  <Input label="Lien URL cible" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" required />
                )}

                {selectedType === 'text' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Texte brut</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-white/5 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                      placeholder="Votre texte ici..."
                      required
                    />
                  </div>
                )}

                {selectedType === 'phone' && (
                  <Input label="Numéro de téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" required />
                )}

                {selectedType === 'sms' && (
                  <div className="grid grid-cols-1 gap-4">
                    <Input label="Numéro de téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" required />
                    <Input label="Message SMS" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Texte pré-rempli..." />
                  </div>
                )}

                {selectedType === 'email' && (
                  <div className="grid grid-cols-1 gap-4">
                    <Input label="Adresse e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="destinataire@example.com" required />
                    <Input label="Objet" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet du mail" />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Corps du message</label>
                      <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/5 text-sm text-white rounded-xl py-3 px-4 focus:outline-none" placeholder="Texte du mail..." />
                    </div>
                  </div>
                )}

                {selectedType === 'whatsapp' && (
                  <div className="grid grid-cols-1 gap-4">
                    <Input label="Numéro de téléphone (format international)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="33612345678" required />
                    <Input label="Message WhatsApp" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message pré-rempli..." />
                  </div>
                )}

                {selectedType === 'wifi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Nom du réseau (SSID)" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="SSID" required />
                    <Input label="Mot de passe" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder="Mot de passe" />
                    <Select label="Sécurité" value={wifiSecurity} onChange={(e) => setWifiSecurity(e.target.value)} options={[{ value: 'WPA', label: 'WPA/WPA2' }, { value: 'WEP', label: 'WEP' }, { value: 'nopass', label: 'Aucune' }]} />
                  </div>
                )}

                {selectedType === 'vcard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Prénom" value={vFirstName} onChange={(e) => setVFirstName(e.target.value)} placeholder="Jean" required />
                    <Input label="Nom" value={vLastName} onChange={(e) => setVLastName(e.target.value)} placeholder="Dupont" required />
                    <Input label="Organisation" value={vOrg} onChange={(e) => setVOrg(e.target.value)} placeholder="Société" />
                    <Input label="Titre / Poste" value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="Directeur" />
                    <Input label="E-mail de contact" type="email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} placeholder="jean@societe.com" />
                    <Input label="Téléphone" type="tel" value={vPhone} onChange={(e) => setVPhone(e.target.value)} placeholder="0612345678" />
                    <Input label="Site Web" type="url" value={vWebsite} onChange={(e) => setVWebsite(e.target.value)} placeholder="https://societe.com" />
                    <Input label="Adresse" value={vAddress} onChange={(e) => setVAddress(e.target.value)} placeholder="Adresse postale" />
                  </div>
                )}

                {selectedType === 'location' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="48.8566" required />
                    <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="2.3522" required />
                  </div>
                )}

                {(selectedType === 'pdf' || selectedType === 'image' || selectedType === 'video') && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/5 hover:border-indigo-500/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-950/40 relative">
                      <input
                        type="file"
                        accept={selectedType === 'pdf' ? '.pdf' : selectedType === 'image' ? 'image/*' : 'video/*'}
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                      <p className="text-xs text-slate-300 font-bold">Glissez ou sélectionnez un fichier</p>
                      <p className="text-[10px] text-slate-500 mt-1">Taille maximale : 5 Mo</p>
                      {uploadFile && (
                        <div className="mt-3">
                          <Badge variant="success">Fichier sélectionné : {uploadFile.name}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-xs text-slate-500">— OU —</div>
                    <Input label="URL de redirection directe" type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://votre-stockage.com/fichier" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Styling */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Personnalisez l'apparence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Couleur des modules (Foreground)</label>
                      <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/5">
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                        <span className="text-xs font-mono text-slate-300 uppercase">{fgColor}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Couleur de fond (Background)</label>
                      <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/5">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                        <span className="text-xs font-mono text-slate-300 uppercase">{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  <Select
                    label="Taille de l'image (en pixels)"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    options={[{ value: 200, label: 'Petit (200x200)' }, { value: 300, label: 'Moyen (300x300)' }, { value: 500, label: 'Grand (500x500)' }]}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Ajouter un logo au centre (optionnel)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="w-full text-xs text-slate-400 file:bg-slate-800 file:border-none file:text-slate-300 file:px-3 file:py-1.5 file:rounded file:mr-2 file:cursor-pointer"
                    />
                    {logoFile && <p className="text-[10px] text-green-400 mt-1">Logo sélectionné : {logoFile.name}</p>}
                  </div>
                </div>

                {/* Local Appearance Preview Box */}
                <div className="bg-slate-950/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-36 h-36 bg-white p-2 rounded-2xl flex items-center justify-center relative overflow-hidden" style={{ background: bgColor }}>
                    <QrCode className="w-full h-full" style={{ color: fgColor }} />
                    {logoFile && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-700">
                        Logo
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                    Prévisualisation schématique de votre palette de couleurs et logo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview Details */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">4. Récapitulatif des données</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="bg-slate-950/30 border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nom</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Type</span>
                    <div className="mt-1"><Badge variant="info">{selectedType}</Badge></div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Couleurs</span>
                    <p className="text-slate-300 mt-0.5">Modules : {fgColor} | Fond : {bgColor}</p>
                  </div>
                </div>

                <div className="bg-indigo-600/5 border border-indigo-500/10 p-6 rounded-2xl flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Redirection dynamique</h4>
                    <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                      Ce QR Code est dynamique. Après sa création, vous pourrez modifier sa cible et son style à tout moment sans réimprimer le code physique.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirm and Create */}
          {step === 5 && (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Prêt à être généré ?</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Cliquez sur le bouton ci-dessous pour créer votre QR Code. Il sera instantanément disponible au téléchargement dans votre liste.
              </p>
              <div className="pt-4">
                <Button variant="primary" size="lg" loading={loading} onClick={handleCreate}>
                  Générer mon QR Code
                </Button>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          {step < 5 && (
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-800/60">
              <Button variant="secondary" onClick={prevStep} disabled={step === 1} icon={ArrowLeft}>
                Retour
              </Button>
              <Button variant="primary" onClick={nextStep} icon={ArrowRight}>
                Continuer
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
