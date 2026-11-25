import { View } from 'react-native';
import { router } from 'expo-router';
import { findModel } from '@/sample/catalog';
import { useCopy } from '@/i18n';
import { patchSetup, useStore } from '@/store/store';
import { Card, Divider, GlassButton, Header, Icon, Screen, SecondaryButton, Text } from '@/ui';

export default function VariantNotListed() {
  const modelId = useStore((s) => s.setup.modelId);
  const model = findModel(modelId);
  const copy = useCopy();
  const t = copy.carNotListed;
  const family = `${model.name} ${model.variants[0].name.split(' ')[0]}`;
  return (
    <Screen
      header={<Header title={copy.car.title} subtitle={copy.car.stepOf(2, `${model.make} ${model.name}`)} />}
      footer={
        <>
          <GlassButton
            label={t.useSchedule(family)}
            onPress={() => {
              patchSetup({ variantId: null });
              router.push('/car/odometer');
            }}
          />
          <SecondaryButton label={t.pickAnother} onPress={() => router.back()} />
        </>
      }
    >
      <View className="size-16 items-center justify-center rounded-full bg-optional-bg">
        <Icon name="warning" size={28} colorClassName="accent-optional" stroke={2} />
      </View>
      <Text variant="headline" className="mt-5">
        {t.headline}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        {t.body(family)}
      </Text>
      <Card className="mt-5 !rounded-[28px] !py-1">
        <Point icon="check" title={t.matchTitle} body={t.matchBody(family)} />
        <Divider />
        <Point icon="question" title={t.askTitle} body={t.askBody} />
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
