import { View } from 'react-native';
import { router } from 'expo-router';
import { findModel } from '@/sample/catalog';
import { patchSetup, useStore } from '@/store/store';
import { Card, Divider, GlassButton, Header, Icon, Screen, SecondaryButton, Text } from '@/ui';

export default function VariantNotListed() {
  const modelId = useStore((s) => s.setup.modelId);
  const model = findModel(modelId);
  const family = `${model.name} ${model.variants[0].name.split(' ')[0]}`;
  return (
    <Screen
      header={<Header title="Pick your car" subtitle={`Step 2 of 4 · ${model.make} ${model.name}`} />}
      footer={
        <>
          <GlassButton
            label={`Use the ${family} schedule`}
            onPress={() => {
              patchSetup({ variantId: null });
              router.push('/car/odometer');
            }}
          />
          <SecondaryButton label="Pick another variant" onPress={() => router.back()} />
        </>
      }
    >
      <View className="size-16 items-center justify-center rounded-full bg-optional-bg">
        <Icon name="warning" size={28} colorClassName="accent-optional" stroke={2} />
      </View>
      <Text variant="headline" className="mt-5">
        We don’t have your exact variant yet.
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        We can still check your quote against the {family} schedule. Some items may differ for your car.
      </Text>
      <Card className="mt-5 !rounded-[28px] !py-1">
        <Point icon="check" title="Most items will match" body={`Oil, filters and brakes are the same across the ${family} range.`} />
        <Divider />
        <Point icon="question" title="Ask the advisor about the rest" body="If a verdict looks odd, ask to see their schedule for your variant." />
      </Card>
    </Screen>
  );
}

function Point({ icon, title, body }: { icon: 'check' | 'question'; title: string; body: string }) {
  return (
    <View className="flex-row gap-3 py-3.5">
      <View className="size-8 items-center justify-center rounded-full bg-optional-bg">
        <Icon name={icon} size={14} colorClassName="accent-optional" stroke={2.4} />
      </View>
      <View className="flex-1">
        <Text variant="body" weight="bold">
          {title}
        </Text>
        <Text variant="small" color="ink-soft">
          {body}
        </Text>
      </View>
    </View>
  );
}
