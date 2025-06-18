import { Text, View, ScrollView } from "react-native";
import Button from "../Button";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function ThemeShowcase() {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-foreground mb-4">Set Hero Color System</Text>
      
      <View className="mb-8">
        <Text className="text-xl text-foreground mb-4">Theme</Text>
        <ThemeSwitcher />
      </View>
      
      <View className="mb-8">
        <Text className="text-xl text-foreground mb-4">Button Variants</Text>
        <View className="space-y-2">
          <Button 
            title="Primary Button" 
            onPress={() => console.log('Primary button pressed')} 
          />
          <Button 
            title="Secondary Button" 
            variant="secondary"
            onPress={() => console.log('Secondary button pressed')} 
          />
          <Button 
            title="Destructive Button" 
            variant="destructive"
            onPress={() => console.log('Destructive button pressed')} 
          />
          <Button 
            title="Outline Button" 
            variant="outline"
            onPress={() => console.log('Outline button pressed')} 
          />
          <Button 
            title="Ghost Button" 
            variant="ghost"
            onPress={() => console.log('Ghost button pressed')} 
          />
          <Button 
            title="Disabled Button" 
            disabled
            onPress={() => console.log('Disabled button pressed')} 
          />
        </View>
      </View>
      
      <View className="mb-8">
        <Text className="text-xl text-foreground mb-4">Button Sizes</Text>
        <View className="space-y-2">
          <Button 
            title="Small Button" 
            size="sm"
            onPress={() => console.log('Small button pressed')} 
          />
          <Button 
            title="Medium Button" 
            size="md"
            onPress={() => console.log('Medium button pressed')} 
          />
          <Button 
            title="Large Button" 
            size="lg"
            onPress={() => console.log('Large button pressed')} 
          />
        </View>
      </View>
      
      <View className="mb-8">
        <Text className="text-xl text-foreground mb-4">Text Styles</Text>
        <View className="space-y-2">
          <Text className="text-foreground">Normal text (text-foreground)</Text>
          <Text className="text-muted-foreground">Muted text (text-muted-foreground)</Text>
          <Text className="text-primary">Primary text (text-primary)</Text>
          <Text className="text-primary-muted">Primary muted text (text-primary-muted)</Text>
          <View className="bg-foreground p-2 rounded">
            <Text className="text-foreground-inverted">Inverted text (text-foreground-inverted)</Text>
          </View>
        </View>
      </View>
      
      <View className="mb-8">
        <Text className="text-xl text-foreground mb-4">Background Colors</Text>
        <View className="space-y-2">
          <View className="p-2 bg-background border border-stroke rounded">
            <Text className="text-foreground">Background (bg-background)</Text>
          </View>
          <View className="p-2 bg-muted rounded">
            <Text className="text-muted-foreground">Muted (bg-muted)</Text>
          </View>
          <View className="p-2 bg-primary rounded">
            <Text className="text-primary-foreground">Primary (bg-primary)</Text>
          </View>
          <View className="p-2 bg-secondary rounded">
            <Text className="text-secondary-foreground">Secondary (bg-secondary)</Text>
          </View>
          <View className="p-2 bg-destructive rounded">
            <Text className="text-destructive-foreground">Destructive (bg-destructive)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 