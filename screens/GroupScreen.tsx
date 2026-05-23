import {
    Alert,
    Button,
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

type Props = {
    groupId: string;
    groupName: string;
    onBack: () => void;
};

type Member = {
    user_id: string;
};

export default function GroupScreen({
    groupId,
    groupName,
    onBack,
}: Props) {
    const [members, setMembers] = useState<
        Member[]
    >([]);

    const [title, setTitle] = useState("");

    const [amount, setAmount] = useState("");

    async function fetchMembers() {
        const { data, error } =
            await supabase
                .from("group_members")
                .select("*")
                .eq("group_id", groupId);

        if (!error && data) {
            setMembers(data);
        }
    }

    async function handleAddExpense() {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return;
            }

            const totalAmount =
                Number(amount);

            const splitAmount = Math.floor(
                totalAmount / members.length
            );

            const { data, error } =
                await supabase
                    .from("expenses")
                    .insert([
                        {
                            group_id: groupId,
                            paid_by: user.id,
                            title,
                            amount: totalAmount,
                            split_type: "equal",
                        },
                    ])
                    .select()
                    .single();

            if (error) {
                Alert.alert(error.message);

                return;
            }

            const splits = members.map(
                (member) => ({
                    expense_id: data.id,
                    user_id: member.user_id,
                    amount: splitAmount,
                })
            );

            const {
                error: splitError,
            } = await supabase
                .from("expense_splits")
                .insert(splits);

            if (splitError) {
                Alert.alert(splitError.message);

                return;
            }

            Alert.alert("Expense added");

            setTitle("");

            setAmount("");
        } catch (error) {
            Alert.alert("Something went wrong");
        }
    }

    useEffect(() => {
        fetchMembers();
    }, []);

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
                    marginBottom: 24,
                }}
            >
                {groupName}
            </Text>

            <TextInput
                placeholder="Dinner"
                placeholderTextColor="gray"
                value={title}
                onChangeText={setTitle}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 16,
                    color: "white",
                }}
            />

            <TextInput
                placeholder="Amount"
                placeholderTextColor="gray"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 24,
                    color: "white",
                }}
            />

            <Button
                title="Add Expense"
                onPress={handleAddExpense}
            />

            <View
                style={{
                    marginTop: 32,
                }}
            >
                <Text
                    style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "bold",
                        marginBottom: 12,
                    }}
                >
                    Members
                </Text>

                <FlatList
                    data={members}
                    keyExtractor={(item) =>
                        item.user_id
                    }
                    renderItem={({ item }) => (
                        <Text
                            style={{
                                color: "white",
                                marginBottom: 8,
                            }}
                        >
                            {item.user_id}
                        </Text>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}