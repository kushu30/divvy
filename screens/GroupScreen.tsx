import {
    Button,
    SafeAreaView,
    Text,
    View,
} from "react-native";

type Props = {
    groupId: string;
    groupName: string;
    onBack: () => void;
};

export default function GroupScreen({
    groupName,
    onBack,
}: Props) {
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "black",
                padding: 24,
                paddingTop: 60,
            }}
        >
            <View
                style={{
                    marginBottom: 24,
                }}
            >
                <Button
                    title="Back"
                    onPress={onBack}
                />
            </View>

            <Text
                style={{
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                }}
            >
                {groupName}
            </Text>
        </SafeAreaView>
    );
}