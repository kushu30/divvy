import {
    Alert,
    Button,
    ScrollView,
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
    id: string;
    email: string;
};

type Expense = {
    id: string;
    title: string;
    amount: number;
    paid_by: string;
};

export default function GroupScreen({
    groupId,
    groupName,
    onBack,
}: Props) {
    const [members, setMembers] = useState<
        Member[]
    >([]);

    const [expenses, setExpenses] =
        useState<Expense[]>([]);

    const [balances, setBalances] =
        useState<string[]>([]);

    const [email, setEmail] =
        useState("");

    const [title, setTitle] =
        useState("");

    const [amount, setAmount] =
        useState("");

    async function refreshData() {
        try {
            const {
                data: memberRows,
            } = await supabase
                .from("group_members")
                .select("user_id")
                .eq("group_id", groupId);

            if (!memberRows) {
                return;
            }

            const userIds = memberRows.map(
                (member) => member.user_id
            );

            const {
                data: profiles,
            } = await supabase
                .from("profiles")
                .select("id,email")
                .in("id", userIds);

            const {
                data: expensesData,
            } = await supabase
                .from("expenses")
                .select("*")
                .eq("group_id", groupId)
                .order("created_at", {
                    ascending: false,
                });

            if (
                !profiles ||
                !expensesData
            ) {
                return;
            }

            setMembers(profiles);

            setExpenses(expensesData);
        } catch (error) {
            console.log(error);
        }
    }

    async function handleAddMember() {
        try {
            const {
                data: profile,
                error,
            } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", email)
                .single();

            if (error || !profile) {
                Alert.alert(
                    "User not found"
                );

                return;
            }

            const {
                data: existingMember,
            } = await supabase
                .from("group_members")
                .select("*")
                .eq("group_id", groupId)
                .eq("user_id", profile.id)
                .single();

            if (existingMember) {
                Alert.alert(
                    "Member already exists"
                );

                return;
            }

            const {
                error: memberError,
            } = await supabase
                .from("group_members")
                .insert([
                    {
                        group_id: groupId,
                        user_id: profile.id,
                    },
                ]);

            if (memberError) {
                Alert.alert(
                    memberError.message
                );

                return;
            }

            Alert.alert(
                "Member added"
            );

            setEmail("");

            await refreshData();
        } catch (error) {
            Alert.alert(
                "Something went wrong"
            );
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

            if (
                !title ||
                !totalAmount ||
                members.length === 0
            ) {
                Alert.alert(
                    "Invalid expense"
                );

                return;
            }

            const splitAmount =
                totalAmount /
                members.length;

            const {
                data: expense,
                error,
            } = await supabase
                .from("expenses")
                .insert([
                    {
                        title,
                        amount: totalAmount,
                        paid_by: user.id,
                        group_id: groupId,
                        split_type: "equal",
                    },
                ])
                .select()
                .single();

            if (error || !expense) {
                Alert.alert(
                    error?.message ||
                    "Something went wrong"
                );

                return;
            }

            const splits = members.map(
                (member) => ({
                    expense_id: expense.id,
                    user_id: member.id,
                    amount: splitAmount,
                })
            );

            const {
                error: splitError,
            } = await supabase
                .from("expense_splits")
                .insert(splits);

            if (splitError) {
                Alert.alert(
                    splitError.message
                );

                return;
            }

            Alert.alert(
                "Expense added"
            );

            setTitle("");

            setAmount("");

            await refreshData();
        } catch (error) {
            Alert.alert(
                "Something went wrong"
            );
        }
    }

    useEffect(() => {
        refreshData();
    }, [groupId]);

    useEffect(() => {
        if (
            members.length === 0
        ) {
            setBalances([]);

            return;
        }

        const balancesMap: Record<
            string,
            number
        > = {};

        members.forEach((member) => {
            balancesMap[member.id] = 0;
        });

        expenses.forEach((expense) => {
            const splitAmount =
                expense.amount /
                members.length;

            members.forEach((member) => {
                if (
                    member.id !==
                    expense.paid_by
                ) {
                    balancesMap[
                        member.id
                    ] -= splitAmount;

                    balancesMap[
                        expense.paid_by
                    ] += splitAmount;
                }
            });
        });

        const result: string[] = [];

        const creditors =
            members.filter(
                (member) =>
                    balancesMap[
                    member.id
                    ] > 0
            );

        const debtors =
            members.filter(
                (member) =>
                    balancesMap[
                    member.id
                    ] < 0
            );

        for (const debtor of debtors) {
            const creditor =
                creditors[0];

            if (!creditor) {
                continue;
            }

            const amount = Math.abs(
                balancesMap[
                debtor.id
                ]
            );

            if (amount > 0) {
                result.push(
                    `${debtor.email} owes ${creditor.email} ₹${amount.toFixed(0)}`
                );
            }
        }

        setBalances(result);
    }, [members, expenses]);

    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: "black",
                padding: 24,
                paddingTop: 60,
            }}
            contentContainerStyle={{
                paddingBottom: 120,
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
                placeholder="friend@email.com"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 16,
                    color: "white",
                }}
            />

            <Button
                title="Add Member"
                onPress={handleAddMember}
            />

            <View
                style={{
                    marginTop: 32,
                    marginBottom: 32,
                }}
            >
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
                        marginBottom: 16,
                        color: "white",
                    }}
                />

                <Button
                    title="Add Expense"
                    onPress={handleAddExpense}
                />
            </View>

            <View
                style={{
                    marginBottom: 32,
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

                {members.map((item) => (
                    <Text
                        key={item.id}
                        style={{
                            color: "white",
                            marginBottom: 8,
                        }}
                    >
                        {item.email}
                    </Text>
                ))}
            </View>

            <View
                style={{
                    marginBottom: 32,
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
                    Balances
                </Text>

                {balances.length === 0 ? (
                    <Text
                        style={{
                            color: "gray",
                        }}
                    >
                        All settled up
                    </Text>
                ) : (
                    balances.map((balance) => (
                        <Text
                            key={balance}
                            style={{
                                color: "white",
                                marginBottom: 8,
                            }}
                        >
                            {balance}
                        </Text>
                    ))
                )}
            </View>

            <View>
                <Text
                    style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "bold",
                        marginBottom: 12,
                    }}
                >
                    Expenses
                </Text>

                {expenses.map((item) => {
                    const payer =
                        members.find(
                            (member) =>
                                member.id ===
                                item.paid_by
                        );

                    return (
                        <View
                            key={item.id}
                            style={{
                                borderWidth: 1,
                                borderColor: "gray",
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: 18,
                                    fontWeight: "bold",
                                }}
                            >
                                {item.title}
                            </Text>

                            <Text
                                style={{
                                    color: "white",
                                    marginTop: 4,
                                }}
                            >
                                ₹{item.amount}
                            </Text>

                            <Text
                                style={{
                                    color: "gray",
                                    marginTop: 6,
                                }}
                            >
                                Paid by{" "}
                                {payer?.email}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}