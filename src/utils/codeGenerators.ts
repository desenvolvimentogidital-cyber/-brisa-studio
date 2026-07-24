import { CanvasComponent, ExportFramework, Project, Screen } from '../types';

export function generateCode(
  project: Project,
  screen: Screen,
  framework: ExportFramework
): string {
  switch (framework) {
    case 'flutter':
      return generateFlutterCode(screen);
    case 'flutterflow':
      return generateFlutterFlowCode(screen);
    case 'react_native':
      return generateReactNativeCode(screen);
    case 'jetpack_compose':
      return generateJetpackComposeCode(screen);
    case 'swiftui':
      return generateSwiftUICode(screen);
    case 'html_tailwind':
      return generateHtmlTailwindCode(screen);
    case 'xml':
      return generateAndroidXmlCode(screen);
    case 'json':
    default:
      return JSON.stringify(screen, null, 2);
  }
}

// FLUTTER (DART)
function generateFlutterCode(screen: Screen): string {
  const visibleComponents = screen.components.filter((c) => !c.hidden);

  const childrenWidgets = visibleComponents
    .map((c) => {
      let childWidget = '';
      if (c.type === 'text') {
        childWidget = `Text(
            '${c.content || 'Texto'}',
            style: TextStyle(
              fontSize: ${c.fontSize},
              fontWeight: FontWeight.w${c.fontWeight || '400'},
              color: Color(0xFF${c.color.replace('#', '')}),
            ),
          )`;
      } else if (c.type === 'button') {
        childWidget = `ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF${c.backgroundColor.replace('#', '')}),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(${c.border.radiusTopLeft}),
              ),
            ),
            child: Text(
              '${c.content || 'Botão'}',
              style: TextStyle(color: Color(0xFF${c.color.replace('#', '')})),
            ),
          )`;
      } else if (c.type === 'image') {
        childWidget = `ClipRRect(
            borderRadius: BorderRadius.circular(${c.border.radiusTopLeft}),
            child: Image.network(
              '${c.imageSrc || 'https://via.placeholder.com/150'}',
              fit: BoxFit.${c.objectFit || 'cover'},
            ),
          )`;
      } else if (c.type === 'input' || c.type === 'password') {
        childWidget = `TextField(
            obscureText: ${c.type === 'password'},
            decoration: InputDecoration(
              hintText: '${c.placeholder || ''}',
              filled: true,
              fillColor: Color(0xFF${c.backgroundColor.replace('#', '')}),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(${c.border.radiusTopLeft}),
                borderSide: BorderSide.none,
              ),
            ),
          )`;
      } else {
        childWidget = `Container(
            decoration: BoxDecoration(
              color: Color(0xFF${c.backgroundColor.replace('#', '')}),
              borderRadius: BorderRadius.circular(${c.border.radiusTopLeft}),
            ),
            child: Center(child: Text('${c.name}')),
          )`;
      }

      return `        Positioned(
          left: ${c.x}.0,
          top: ${c.y}.0,
          width: ${c.width}.0,
          height: ${c.height}.0,
          child: ${childWidget},
        );`;
    })
    .join('\n\n');

  return `import 'package:flutter/material.dart';

class ${sanitizeClassName(screen.name)}Screen extends StatelessWidget {
  const ${sanitizeClassName(screen.name)}Screen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF${screen.backgroundColor.replace('#', '')}),
      body: SafeArea(
        child: Stack(
          children: [
${childrenWidgets}
          ],
        ),
      ),
    );
  }
}`;
}

// REACT NATIVE (TSX)
function generateReactNativeCode(screen: Screen): string {
  const visibleComponents = screen.components.filter((c) => !c.hidden);

  const componentElements = visibleComponents
    .map((c) => {
      if (c.type === 'text') {
        return `      <Text style={[styles.${sanitizeVarName(c.id)}, styles.${sanitizeVarName(c.id)}Text]}>
        {${JSON.stringify(c.content || 'Texto')}}
      </Text>`;
      } else if (c.type === 'button') {
        return `      <TouchableOpacity style={styles.${sanitizeVarName(c.id)}} activeOpacity={0.8}>
        <Text style={styles.${sanitizeVarName(c.id)}Text}>{${JSON.stringify(c.content || 'Botão')}}</Text>
      </TouchableOpacity>`;
      } else if (c.type === 'image') {
        return `      <Image
        source={{ uri: ${JSON.stringify(c.imageSrc || 'https://via.placeholder.com/150')} }}
        style={styles.${sanitizeVarName(c.id)}}
        resizeMode="${c.objectFit || 'cover'}"
      />`;
      } else if (c.type === 'input' || c.type === 'password') {
        return `      <TextInput
        placeholder=${JSON.stringify(c.placeholder || '')}
        secureTextEntry={${c.type === 'password'}}
        style={styles.${sanitizeVarName(c.id)}}
      />`;
      } else {
        return `      <View style={styles.${sanitizeVarName(c.id)}}>
        <Text style={{ color: '${c.color}' }}>{${JSON.stringify(c.content || c.name)}}</Text>
      </View>`;
      }
    })
    .join('\n\n');

  const stylesObj = visibleComponents
    .map((c) => {
      return `  ${sanitizeVarName(c.id)}: {
    position: 'absolute',
    left: ${c.x},
    top: ${c.y},
    width: ${c.width},
    height: ${c.height},
    backgroundColor: '${c.backgroundColor}',
    borderRadius: ${c.border.radiusTopLeft},
    ${c.type === 'button' ? 'justifyContent: "center", alignItems: "center",' : ''}
  },
  ${sanitizeVarName(c.id)}Text: {
    fontSize: ${c.fontSize},
    fontWeight: '${c.fontWeight}',
    color: '${c.color}',
    textAlign: '${c.textAlign}',
  },`;
    })
    .join('\n');

  return `import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';

export default function ${sanitizeClassName(screen.name)}Screen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.canvas}>
${componentElements}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${screen.backgroundColor}',
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
${stylesObj}
});`;
}

// JETPACK COMPOSE (KOTLIN)
function generateJetpackComposeCode(screen: Screen): string {
  const visibleComponents = screen.components.filter((c) => !c.hidden);

  const composables = visibleComponents
    .map((c) => {
      if (c.type === 'text') {
        return `        Text(
            text = "${c.content || 'Texto'}",
            fontSize = ${c.fontSize}.sp,
            color = Color(0xFF${c.color.replace('#', '')}),
            modifier = Modifier.offset(x = ${c.x}.dp, y = ${c.y}.dp)
        )`;
      } else if (c.type === 'button') {
        return `        Button(
            onClick = { /* TODO */ },
            modifier = Modifier
                .offset(x = ${c.x}.dp, y = ${c.y}.dp)
                .size(width = ${c.width}.dp, height = ${c.height}.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF${c.backgroundColor.replace('#', '')})),
            shape = RoundedCornerShape(${c.border.radiusTopLeft}.dp)
        ) {
            Text("${c.content || 'Botão'}", color = Color(0xFF${c.color.replace('#', '')}))
        }`;
      } else {
        return `        Box(
            modifier = Modifier
                .offset(x = ${c.x}.dp, y = ${c.y}.dp)
                .size(width = ${c.width}.dp, height = ${c.height}.dp)
                .background(Color(0xFF${c.backgroundColor.replace('#', '')}), shape = RoundedCornerShape(${c.border.radiusTopLeft}.dp))
        )`;
      }
    })
    .join('\n\n');

  return `import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ${sanitizeClassName(screen.name)}Screen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF${screen.backgroundColor.replace('#', '')}))
    ) {
${composables}
    }
}`;
}

// SWIFTUI (SWIFT)
function generateSwiftUICode(screen: Screen): string {
  const visibleComponents = screen.components.filter((c) => !c.hidden);

  const views = visibleComponents
    .map((c) => {
      if (c.type === 'text') {
        return `            Text("${c.content || 'Texto'}")
                .font(.system(size: ${c.fontSize}, weight: .semibold))
                .foregroundColor(Color(hex: "${c.color}"))
                .position(x: ${c.x + c.width / 2}, y: ${c.y + c.height / 2})`;
      } else if (c.type === 'button') {
        return `            Button(action: {}) {
                Text("${c.content || 'Botão'}")
                    .frame(width: ${c.width}, height: ${c.height})
                    .background(Color(hex: "${c.backgroundColor}"))
                    .foregroundColor(Color(hex: "${c.color}"))
                    .cornerRadius(${c.border.radiusTopLeft})
            }
            .position(x: ${c.x + c.width / 2}, y: ${c.y + c.height / 2})`;
      } else {
        return `            RoundedRectangle(cornerRadius: ${c.border.radiusTopLeft})
                .fill(Color(hex: "${c.backgroundColor}"))
                .frame(width: ${c.width}, height: ${c.height})
                .position(x: ${c.x + c.width / 2}, y: ${c.y + c.height / 2})`;
      }
    })
    .join('\n\n');

  return `import SwiftUI

struct ${sanitizeClassName(screen.name)}View: View {
    var body: some View {
        ZStack {
            Color(hex: "${screen.backgroundColor}")
                .ignoresSafeArea()
            
${views}
        }
    }
}`;
}

// HTML & TAILWIND CSS
function generateHtmlTailwindCode(screen: Screen): string {
  const visibleComponents = screen.components.filter((c) => !c.hidden);

  const elements = visibleComponents
    .map((c) => {
      const style = `position: absolute; left: ${c.x}px; top: ${c.y}px; width: ${c.width}px; height: ${c.height}px; background-color: ${c.backgroundColor}; border-radius: ${c.border.radiusTopLeft}px; z-index: ${c.zIndex}; color: ${c.color}; font-size: ${c.fontSize}px;`;

      if (c.type === 'text') {
        return `    <!-- ${c.name} -->
    <div style="${style}" class="flex items-center font-sans font-semibold">
      <span>${escapeHtml(c.content || 'Texto')}</span>
    </div>`;
      } else if (c.type === 'button') {
        return `    <!-- ${c.name} -->
    <button style="${style}" class="flex items-center justify-center font-medium shadow-md hover:opacity-90 transition">
      ${escapeHtml(c.content || 'Botão')}
    </button>`;
      } else if (c.type === 'image') {
        return `    <!-- ${c.name} -->
    <img src="${c.imageSrc || 'https://via.placeholder.com/150'}" style="${style}" class="object-cover" alt="${c.name}" />`;
      } else if (c.type === 'input' || c.type === 'password') {
        return `    <!-- ${c.name} -->
    <input type="${c.type === 'password' ? 'password' : 'text'}" placeholder="${escapeHtml(c.placeholder || '')}" style="${style}" class="px-4 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />`;
      } else {
        return `    <!-- ${c.name} -->
    <div style="${style}" class="p-2 overflow-hidden">
      ${escapeHtml(c.content || c.name)}
    </div>`;
      }
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${screen.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="background-color: ${screen.backgroundColor};" class="min-h-screen flex justify-center items-center">
  
  <!-- Mobile App Frame Container -->
  <div class="relative overflow-hidden shadow-2xl" style="width: 393px; height: 852px; background-color: ${screen.backgroundColor}; border-radius: 40px;">
    
${elements}

  </div>

</body>
</html>`;
}

// FLUTTERFLOW (JSON SCHEMA)
function generateFlutterFlowCode(screen: Screen): string {
  const ffSpec = {
    screenName: screen.name,
    type: 'FlutterFlowScreen',
    version: '1.0',
    backgroundColor: screen.backgroundColor,
    widgetTree: screen.components.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      layout: {
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        zIndex: c.zIndex,
      },
      styling: {
        color: c.color,
        backgroundColor: c.backgroundColor,
        borderRadius: c.border.radiusTopLeft,
        fontSize: c.fontSize,
      },
    })),
  };

  return JSON.stringify(ffSpec, null, 2);
}

// ANDROID XML LAYOUT
function generateAndroidXmlCode(screen: Screen): string {
  const visibleComponents = screen.components.filter((c) => !c.hidden);

  const views = visibleComponents
    .map((c) => {
      return `    <!-- ${c.name} -->
    <View
        android:id="@+id/${sanitizeVarName(c.id)}"
        android:layout_width="${c.width}dp"
        android:layout_height="${c.height}dp"
        android:layout_marginStart="${c.x}dp"
        android:layout_marginTop="${c.y}dp"
        android:background="${c.backgroundColor}"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />`;
    })
    .join('\n\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="${screen.backgroundColor}">

${views}

</androidx.constraintlayout.widget.ConstraintLayout>`;
}

// Helper utilities
function sanitizeClassName(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function sanitizeVarName(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
