import React from 'react';
import { CanvasComponent } from '../../types';
import * as LucideIcons from 'lucide-react';

interface ComponentRendererProps {
  component: CanvasComponent;
  isInteractive?: boolean;
  onEvent?: (action: string, payload?: any) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = React.memo(({
  component,
  isInteractive = false,
  onEvent,
}) => {
  if (component.hidden) return null;

  // Render Icon helper
  const renderLucideIcon = (iconName?: string, className = 'w-4 h-4') => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className={className} />;
  };

  // Convert border & gradient properties to CSS style
  const getStyleObj = (): React.CSSProperties => {
    const {
      width,
      height,
      backgroundColor,
      gradient,
      border,
      shadow,
      opacity,
      fontFamily,
      fontSize,
      fontWeight,
      color,
      textAlign,
      letterSpacing,
      lineHeight,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      backdropBlur,
    } = component;

    let backgroundCSS: string = backgroundColor;
    if (gradient && gradient.enabled) {
      backgroundCSS = `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`;
    }

    let boxShadowCSS = 'none';
    if (shadow && shadow.enabled) {
      boxShadowCSS = `${shadow.inset ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
      background: backgroundCSS,
      opacity,
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight: fontWeight as any,
      color,
      textAlign,
      letterSpacing: `${letterSpacing}px`,
      lineHeight,
      padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
      borderStyle: border.style !== 'none' ? border.style : undefined,
      borderColor: border.color,
      borderWidth: `${border.width}px`,
      borderRadius: `${border.radiusTopLeft}px ${border.radiusTopRight}px ${border.radiusBottomRight}px ${border.radiusBottomLeft}px`,
      boxShadow: boxShadowCSS,
      backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : undefined,
      overflow: 'hidden',
      boxSizing: 'border-box',
    };
  };

  const styleObj = getStyleObj();

  // Render by Component Type
  switch (component.type) {
    case 'text':
      return (
        <div style={styleObj} className="flex items-center break-words select-none">
          <span className="w-full">{component.content || 'Texto Exemplo'}</span>
        </div>
      );

    case 'button':
      return (
        <button
          style={styleObj}
          className="flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 select-none"
        >
          {component.iconPosition === 'left' && renderLucideIcon(component.iconName)}
          <span>{component.content || 'Botão'}</span>
          {component.iconPosition === 'right' && renderLucideIcon(component.iconName)}
        </button>
      );

    case 'image':
      return (
        <div style={styleObj} className="relative overflow-hidden">
          <img
            src={
              component.imageSrc ||
              'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80'
            }
            alt={component.name}
            className="w-full h-full"
            style={{ objectFit: component.objectFit || 'cover' }}
          />
        </div>
      );

    case 'icon':
      return (
        <div style={styleObj} className="flex items-center justify-center">
          {renderLucideIcon(component.iconName, 'w-3/5 h-3/5')}
        </div>
      );

    case 'badge':
      return (
        <div style={styleObj} className="flex items-center justify-center font-bold text-[10px] tracking-wide uppercase">
          <span>{component.content || 'BADGE'}</span>
        </div>
      );

    case 'chip':
      return (
        <div style={styleObj} className="flex items-center justify-center gap-1.5 font-medium select-none">
          {renderLucideIcon(component.iconName, 'w-3.5 h-3.5')}
          <span>{component.content || 'Tag'}</span>
        </div>
      );

    case 'avatar':
      return (
        <div style={styleObj} className="overflow-hidden flex items-center justify-center">
          <img
            src={
              component.imageSrc ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
            }
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      );

    case 'divider':
      return <div style={styleObj} />;

    case 'input':
    case 'password':
      return (
        <div style={styleObj} className="flex items-center gap-2">
          {component.iconPosition === 'left' && (
            <span className="text-slate-400 shrink-0">{renderLucideIcon(component.iconName)}</span>
          )}
          <input
            type={component.type === 'password' ? 'password' : 'text'}
            placeholder={component.placeholder || 'Digite aqui...'}
            defaultValue={component.content}
            readOnly={!isInteractive}
            className="w-full h-full bg-transparent outline-none text-current placeholder-slate-400"
          />
        </div>
      );

    case 'checkbox':
      return (
        <div style={styleObj} className="flex items-center gap-2 cursor-pointer select-none">
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition ${
              component.checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
            }`}
          >
            {component.checked && <LucideIcons.Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs font-medium text-slate-700">{component.content || 'Opção Checkbox'}</span>
        </div>
      );

    case 'switch':
      return (
        <div style={styleObj} className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-medium text-slate-700">{component.content || 'Alternar Chave'}</span>
          <div
            className={`w-11 h-6 rounded-full p-0.5 transition duration-200 flex items-center ${
              component.checked ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </div>
        </div>
      );

    case 'slider':
      return (
        <div style={styleObj} className="flex items-center">
          <input
            type="range"
            min={component.minValue || 0}
            max={component.maxValue || 100}
            defaultValue={component.value || 50}
            disabled={!isInteractive}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      );

    case 'progressbar':
      return (
        <div style={styleObj} className="relative overflow-hidden bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${component.value || 60}%` }}
          />
        </div>
      );

    case 'card':
      return (
        <div style={styleObj} className="relative flex flex-col justify-between">
          {component.imageSrc && (
            <img
              src={component.imageSrc}
              alt="Card"
              className="w-full h-28 object-cover rounded-t-lg"
            />
          )}
          <div className="p-3">
            <h4 className="font-semibold text-sm text-slate-800">{component.content || 'Título do Card'}</h4>
            <p className="text-xs text-slate-500 mt-1">Descrição e detalhes do conteúdo do card.</p>
          </div>
        </div>
      );

    case 'container':
    case 'row':
    case 'column':
    case 'grid':
    case 'scroll':
      return <div style={styleObj} className="relative" />;

    case 'top_app_bar':
      return (
        <div style={styleObj} className="flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <LucideIcons.Menu className="w-5 h-5 text-slate-700" />
            <span className="font-bold text-slate-800">{component.content || 'App Title'}</span>
          </div>
          {renderLucideIcon(component.iconName || 'Bell', 'w-5 h-5 text-slate-700')}
        </div>
      );

    case 'bottom_nav':
      return (
        <div style={styleObj} className="flex items-center justify-around px-2 border-t border-slate-100">
          {(component.items || ['Home', 'Search', 'Profile']).map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 text-blue-600 cursor-pointer">
              {idx === 0 ? (
                <LucideIcons.Home className="w-5 h-5" />
              ) : idx === 1 ? (
                <LucideIcons.Search className="w-5 h-5 text-slate-400" />
              ) : (
                <LucideIcons.User className="w-5 h-5 text-slate-400" />
              )}
              <span className={`text-[10px] ${idx === 0 ? 'font-bold text-blue-600' : 'text-slate-400'}`}>
                {item}
              </span>
            </div>
          ))}
        </div>
      );

    case 'floating_button':
      return (
        <div style={styleObj} className="flex items-center justify-center cursor-pointer active:scale-90 transition">
          {renderLucideIcon(component.iconName || 'Plus', 'w-6 h-6 text-white')}
        </div>
      );

    case 'tabs':
      return (
        <div style={styleObj} className="flex items-center p-1 gap-1">
          {(component.items || ['Aba 1', 'Aba 2', 'Aba 3']).map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center py-1.5 text-xs rounded-lg font-medium transition cursor-pointer ${
                idx === 0 ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      );

    case 'carousel':
      return (
        <div style={styleObj} className="relative overflow-hidden rounded-2xl">
          <img
            src={component.imageSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
            alt="Carousel"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      );

    case 'map':
      return (
        <div style={styleObj} className="relative bg-sky-100 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <LucideIcons.MapPin className="w-8 h-8 text-red-500 animate-bounce relative z-10" />
          <span className="text-xs font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded shadow-xs relative z-10 mt-1">
            {component.content || 'Localização no Mapa'}
          </span>
        </div>
      );

    case 'calendar':
      return (
        <div style={styleObj} className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between font-bold text-xs text-slate-800 border-b pb-2">
            <span>Julho 2026</span>
            <LucideIcons.Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-600 pt-1">
            <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            <span className="text-slate-300">28</span><span className="text-slate-300">29</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            <span>6</span><span>7</span><span>8</span><span className="bg-blue-600 text-white rounded-full font-bold">9</span><span>10</span><span>11</span><span>12</span>
          </div>
        </div>
      );

    case 'video':
      return (
        <div style={styleObj} className="relative bg-slate-900 flex items-center justify-center group">
          <LucideIcons.PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 transition cursor-pointer" />
          <span className="absolute bottom-2 left-2 text-[10px] text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
            02:45
          </span>
        </div>
      );

    case 'audio':
      return (
        <div style={styleObj} className="flex items-center gap-3 px-3">
          <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
            <LucideIcons.Play className="w-5 h-5 ml-0.5 fill-current" />
          </button>
          <div className="flex-1">
            <div className="text-xs font-semibold truncate text-white">{component.content || 'Audio Track'}</div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full w-2/5" />
            </div>
          </div>
        </div>
      );

    case 'modal':
      return (
        <div style={styleObj} className="p-4 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-slate-800">{component.content || 'Diálogo Modal'}</h3>
            <LucideIcons.X className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 my-2">Esta é uma janela modal flutuante para confirmações ou avisos.</p>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">Cancelar</button>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg font-medium">Confirmar</button>
          </div>
        </div>
      );

    default:
      return (
        <div style={styleObj} className="flex items-center justify-center text-xs font-medium">
          <span>{component.name}</span>
        </div>
      );
  }
});
