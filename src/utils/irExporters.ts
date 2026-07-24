import { StudioIR, IRScreen, IRComponent } from './irCompiler';

export interface GeneratedExportResult {
  framework: 'flutter' | 'react-native' | 'kotlin' | 'swiftui' | 'html';
  files: { path: string; content: string }[];
}

/**
 * Generate Flutter event handler code from IR events
 */
function generateFlutterEvents(comp: IRComponent): string {
  const events = comp.events || {};
  const onClick = events.onClick;
  if (onClick && onClick.enabled && onClick.actions.length > 0) {
    const actions = onClick.actions.filter(a => !a.disabled);
    if (actions.length > 0) {
      const actionCode = actions.map(a => {
        switch (a.type) {
          case 'navigation': return `Navigator.pushNamed(context, '${a.targetScreenId || '/'}');`;
          case 'toast': return `ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("${a.toastMessage || ''}")));`;
          case 'javascript': return `// JS: ${a.javaScript}`;
          default: return `// Action: ${a.type}`;
        }
      }).join('\n            ');
      return `() {\n            ${actionCode}\n          }`;
    }
  }
  return '() {\n            // No action configured\n          }';
}

/**
 * Generate React Native event handler code from IR events
 */
function generateRNEvents(comp: IRComponent): string {
  const events = comp.events || {};
  const onClick = events.onClick;
  if (onClick && onClick.enabled && onClick.actions.length > 0) {
    const actions = onClick.actions.filter(a => !a.disabled);
    if (actions.length > 0) {
      const actionCode = actions.map(a => {
        switch (a.type) {
          case 'navigation': return `navigation.navigate('${a.targetScreenId || 'Home'}');`;
          case 'toast': return `Alert.alert('', '${a.toastMessage || ''}');`;
          case 'javascript': return `// JS: ${a.javaScript}`;
          default: return `// Action: ${a.type}`;
        }
      }).join('\n              ');
      return `() => {\n              ${actionCode}\n            }`;
    }
  }
  return '() => {\n              // No action configured\n            }';
}

/**
 * Generate Kotlin event handler code from IR events
 */
function generateKotlinEvents(comp: IRComponent): string {
  const events = comp.events || {};
  const onClick = events.onClick;
  if (onClick && onClick.enabled && onClick.actions.length > 0) {
    const actions = onClick.actions.filter(a => !a.disabled);
    if (actions.length > 0) {
      const actionCode = actions.map(a => {
        switch (a.type) {
          case 'navigation': return `// Navigate to ${a.targetScreenId || 'Home'}`;
          case 'toast': return `// Toast: ${a.toastMessage || ''}`;
          case 'javascript': return `// JS: ${a.javaScript}`;
          default: return `// Action: ${a.type}`;
        }
      }).join('\n                ');
      return `{\n                ${actionCode}\n            }`;
    }
  }
  return '{ /* No action configured */ }';
}

/**
 * Generate SwiftUI event handler code from IR events
 */
function generateSwiftUIEvents(comp: IRComponent): string {
  const events = comp.events || {};
  const onClick = events.onClick;
  if (onClick && onClick.enabled && onClick.actions.length > 0) {
    const actions = onClick.actions.filter(a => !a.disabled);
    if (actions.length > 0) {
      const actionCode = actions.map(a => {
        switch (a.type) {
          case 'navigation': return `// Navigate to ${a.targetScreenId || 'Home'}`;
          case 'toast': return `// Toast: ${a.toastMessage || ''}`;
          case 'javascript': return `// JS: ${a.javaScript}`;
          default: return `// Action: ${a.type}`;
        }
      }).join('\n                ');
      return `{\n                ${actionCode}\n            }`;
    }
  }
  return '{ /* No action configured */ }';
}

/**
 * Generate HTML event handler code from IR events
 */
function generateHTMLEvents(comp: IRComponent): string {
  const events = comp.events || {};
  const onClick = events.onClick;
  if (onClick && onClick.enabled && onClick.actions.length > 0) {
    const actions = onClick.actions.filter(a => !a.disabled);
    if (actions.length > 0) {
      const actionCode = actions.map(a => {
        switch (a.type) {
          case 'navigation': return `window.location.hash = '#/${a.targetScreenId || ''}';`;
          case 'toast': return `alert('${a.toastMessage || ''}');`;
          case 'javascript': return a.javaScript || '';
          default: return `// Action: ${a.type}`;
        }
      }).join('; ');
      return `onclick="${actionCode}"`;
    }
  }
  return '';
}

/**
 * Flutter Code Exporter based strictly on Intermediate Representation (IR).
 */
export function exportToFlutter(ir: StudioIR): GeneratedExportResult {
  const sanitizeName = (str: string) =>
    str.replace(/[^a-zA-Z0-9]/g, '');

  const generateWidget = (comp: IRComponent): string => {
    if (comp.type === 'button') {
      return `
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Color(0xFF${comp.backgroundColor.replace('#', '')}),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(${comp.borderRadius}),
            ),
          ),
          onPressed: ${generateFlutterEvents(comp)},
          child: Text("${comp.content}"),
        )`;
    }

    if (comp.type === 'text') {
      return `
        Text(
          "${comp.content}",
          style: TextStyle(
            fontSize: ${comp.fontSize},
            color: Color(0xFF${comp.color.replace('#', '')}),
          ),
        )`;
    }

    const childWidgets = comp.children.map(generateWidget).join(',\n');
    return `
      Container(
        width: ${comp.width},
        height: ${comp.height},
        decoration: BoxDecoration(
          color: Color(0xFF${comp.backgroundColor.replace('#', '')}),
          borderRadius: BorderRadius.circular(${comp.borderRadius}),
        ),
        child: Column(
          children: [
            ${childWidgets}
          ],
        ),
      )`;
  };

  const files = ir.screens.map((screen: IRScreen) => {
    const className = `${sanitizeName(screen.name)}Screen`;
    const widgetsCode = screen.components.map(generateWidget).join(',\n');

    const content = `
import 'package:flutter/material.dart';

class ${className} extends StatelessWidget {
  const ${className}({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF${screen.backgroundColor.replace('#', '')}),
      appBar: AppBar(title: Text("${screen.name}")),
      body: SingleChildScrollView(
        child: Column(
          children: [
            ${widgetsCode}
          ],
        ),
      ),
    );
  }
}
`;
    return { path: `lib/screens/${screen.name.toLowerCase()}_screen.dart`, content };
  });

  // Add main.dart
  files.push({
    path: 'lib/main.dart',
    content: `
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${ir.appInfo.name}',
      theme: ThemeData.dark(),
      home: const Scaffold(
        body: Center(child: Text('${ir.appInfo.name} running on Flutter')),
      ),
    );
  }
}
`,
  });

  return { framework: 'flutter', files };
}

/**
 * React Native Code Exporter based on IR.
 */
export function exportToReactNative(ir: StudioIR): GeneratedExportResult {
  const sanitizeName = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');

  const generateJSX = (comp: IRComponent): string => {
    if (comp.type === 'button') {
      return `
      <TouchableOpacity
        style={{
          backgroundColor: '${comp.backgroundColor}',
          borderRadius: ${comp.borderRadius},
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
        onPress={() => console.log('Clicked ${comp.name}')}
      >
        <Text style={{ color: '${comp.color}', fontSize: ${comp.fontSize} }}>
          ${comp.content}
        </Text>
      </TouchableOpacity>`;
    }

    if (comp.type === 'text') {
      return `<Text style={{ color: '${comp.color}', fontSize: ${comp.fontSize} }}>${comp.content}</Text>`;
    }

    return `
      <View style={{ width: ${comp.width}, height: ${comp.height}, backgroundColor: '${comp.backgroundColor}' }}>
        ${comp.children.map(generateJSX).join('\n')}
      </View>`;
  };

  const files = ir.screens.map((screen) => {
    const componentName = `${sanitizeName(screen.name)}Screen`;
    const jsxCode = screen.components.map(generateJSX).join('\n');

    const content = `
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export function ${componentName}() {
  return (
    <ScrollView style={styles.container}>
      ${jsxCode}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${screen.backgroundColor}',
  },
});
`;
    return { path: `src/screens/${componentName}.tsx`, content };
  });

  return { framework: 'react-native', files };
}

/**
 * Kotlin Jetpack Compose Code Exporter based on IR.
 */
export function exportToKotlinCompose(ir: StudioIR): GeneratedExportResult {
  const sanitizeName = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');

  const generateCompose = (comp: IRComponent): string => {
    if (comp.type === 'button') {
      return `
        Button(
            onClick = { /* Action: ${comp.events.onClick || 'none'} */ },
            shape = RoundedCornerShape(${comp.borderRadius}.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF${comp.backgroundColor.replace('#', '')}))
        ) {
            Text(text = "${comp.content}", fontSize = ${comp.fontSize}.sp)
        }`;
    }

    return `
        Text(
            text = "${comp.content}",
            fontSize = ${comp.fontSize}.sp,
            color = Color(0xFF${comp.color.replace('#', '')})
        )`;
  };

  const files = ir.screens.map((screen) => {
    const functionName = `${sanitizeName(screen.name)}Screen`;
    const composeCode = screen.components.map(generateCompose).join('\n');

    const content = `
package ${ir.appInfo.packageName}.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ${functionName}() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        ${composeCode}
    }
}
`;
    return { path: `app/src/main/java/${ir.appInfo.packageName.replace(/\./g, '/')}/ui/${functionName}.kt`, content };
  });

  return { framework: 'kotlin', files };
}

/**
 * SwiftUI Code Exporter based on IR.
 */
export function exportToSwiftUI(ir: StudioIR): GeneratedExportResult {
  const sanitizeName = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');

  const generateSwiftUI = (comp: IRComponent): string => {
    if (comp.type === 'button') {
      return `
            Button(action: {
                // Action: ${comp.events.onClick || 'none'}
            }) {
                Text("${comp.content}")
                    .font(.system(size: ${comp.fontSize}))
                    .foregroundColor(Color.white)
                    .padding()
                    .background(Color("${comp.backgroundColor}"))
                    .cornerRadius(${comp.borderRadius})
            }`;
    }

    return `
            Text("${comp.content}")
                .font(.system(size: ${comp.fontSize}))
                .foregroundColor(Color("${comp.color}"))`;
  };

  const files = ir.screens.map((screen) => {
    const viewName = `${sanitizeName(screen.name)}View`;
    const swiftCode = screen.components.map(generateSwiftUI).join('\n');

    const content = `
import SwiftUI

struct ${viewName}: View {
    var body: some View {
        VStack {
            ${swiftCode}
        }
        .padding()
        .background(Color("${screen.backgroundColor}"))
    }
}

struct ${viewName}_Previews: PreviewProvider {
    static var previews: some View {
        ${viewName}()
    }
}
`;
    return { path: `Views/${viewName}.swift`, content };
  });

  return { framework: 'swiftui', files };
}

/**
 * HTML/PWA Code Exporter based on IR.
 */
export function exportToHTML(ir: StudioIR): GeneratedExportResult {
  const sanitizeName = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');

  const generateHTML = (comp: IRComponent): string => {
    const events = comp.events || {};
    const eventAttrs: string[] = [];
    
    // Generate event attributes
    Object.entries(events).forEach(([eventType, config]) => {
      if (config && config.enabled && config.actions.length > 0) {
        const actions = config.actions.filter(a => !a.disabled);
        if (actions.length > 0) {
          const jsCode = actions.map(a => {
            switch (a.type) {
              case 'navigation': return `window.location.hash='#/${a.targetScreenId || ''}'`;
              case 'toast': return `alert('${(a.toastMessage || '').replace(/'/g, "\\'")}')`;
              case 'javascript': return a.javaScript || '';
              default: return '';
            }
          }).filter(Boolean).join(';');
          
          if (jsCode) {
            // Convert event type to HTML attribute
            const htmlEvent = eventType.replace(/^on/, 'on').toLowerCase();
            eventAttrs.push(`${htmlEvent}="${jsCode.replace(/"/g, '"')}"`);
          }
        }
      }
    });

    const eventStr = eventAttrs.length > 0 ? ' ' + eventAttrs.join(' ') : '';

    if (comp.type === 'button') {
      return `
    <button style="background-color:${comp.backgroundColor};color:${comp.color};border-radius:${comp.borderRadius}px;padding:10px 16px;border:none;font-size:${comp.fontSize}px;font-weight:${comp.fontWeight};cursor:pointer"${eventStr}>
      ${comp.content}
    </button>`;
    }

    if (comp.type === 'text') {
      return `
    <p style="color:${comp.color};font-size:${comp.fontSize}px;font-weight:${comp.fontWeight};margin:0"${eventStr}>
      ${comp.content}
    </p>`;
    }

    if (comp.type === 'image') {
      return `
    <img src="${comp.content || 'https://via.placeholder.com/300'}" alt="${comp.name}" style="width:${comp.width}px;height:${comp.height}px;object-fit:cover;border-radius:${comp.borderRadius}px"${eventStr} />`;
    }

    if (comp.type === 'input' || comp.type === 'password') {
      return `
    <input type="${comp.type === 'password' ? 'password' : 'text'}" placeholder="${comp.placeholder || ''}" style="width:${comp.width}px;height:${comp.height}px;background-color:${comp.backgroundColor};color:${comp.color};border-radius:${comp.borderRadius}px;border:1px solid #E2E8F0;padding:8px 12px;font-size:${comp.fontSize}px"${eventStr} />`;
    }

    if (comp.type === 'checkbox') {
      return `
    <label style="display:flex;align-items:center;gap:8px;color:${comp.color};font-size:${comp.fontSize}px"${eventStr}>
      <input type="checkbox" ${comp.checked ? 'checked' : ''} />
      ${comp.content}
    </label>`;
    }

    if (comp.type === 'switch') {
      return `
    <label style="display:flex;align-items:center;gap:8px;color:${comp.color};font-size:${comp.fontSize}px"${eventStr}>
      <input type="checkbox" role="switch" ${comp.checked ? 'checked' : ''} style="accent-color:${comp.backgroundColor}" />
      ${comp.content}
    </label>`;
    }

    if (comp.type === 'slider') {
      return `
    <input type="range" min="${comp.minValue || 0}" max="${comp.maxValue || 100}" value="${comp.value || 50}" style="width:${comp.width}px;accent-color:${comp.backgroundColor}"${eventStr} />`;
    }

    if (comp.type === 'progressbar') {
      return `
    <progress value="${comp.value || 0}" max="100" style="width:${comp.width}px;height:${comp.height}px;accent-color:${comp.backgroundColor}"${eventStr}></progress>`;
    }

    const childrenHTML = comp.children.map(generateHTML).join('\n');
    return `
    <div style="width:${comp.width}px;height:${comp.height}px;background-color:${comp.backgroundColor};border-radius:${comp.borderRadius}px;padding:8px;display:flex;flex-direction:column"${eventStr}>
      ${childrenHTML}
    </div>`;
  };

  const files = ir.screens.map((screen) => {
    const htmlCode = screen.components.map(generateHTML).join('\n');

    const content = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ir.appInfo.name} - ${screen.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .screen { width: ${ir.appInfo.deviceWidth}px; min-height: ${ir.appInfo.deviceHeight}px; background-color: ${screen.backgroundColor}; margin: 0 auto; padding: 16px; }
    @media (max-width: ${ir.appInfo.deviceWidth}px) { .screen { width: 100%; } }
  </style>
</head>
<body>
  <div class="screen">
    ${htmlCode}
  </div>
  <script>
    // Mobile Studio Generated App - Event Handlers
    console.log('${ir.appInfo.name} - PWA generated by Mobile Studio');
  </script>
</body>
</html>`;
    return { path: `${screen.name.toLowerCase()}.html`, content };
  });

  return { framework: 'html', files };
}
