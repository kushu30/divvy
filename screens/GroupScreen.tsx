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
    split_type: string;
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

    const [
        currentUserId,
        setCurrentUserId,
    ] = useState("");

    const [email, setEmail] =
        useState("");

    const [title, setTitle] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [
        settlementAmount,
        setSettlementAmount,
    ] = useState("");

    const [
        editingExpenseId,
        setEditingExpenseId,
    ] = useState("");

    const [
        editingTitle,
        setEditingTitle,
    ] = useState("");

    const [
        editingAmount,
        setEditingAmount,
    ] = useState("");

    async function refreshData() {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setCurrentUserId(user.id);

                console.log(
                    "CURRENT USER:",
                    user.id
                );
            }

            const {
                data: memberRows,
                error: memberError,
            } = await supabase
                .from("group_members")
                .select("user_id")
                .eq("group_id", groupId);

            if (
                memberError ||
                !memberRows
            ) {
                console.log(
                    "MEMBER FETCH ERROR:",
                    memberError
                );

                return;
            }

            console.log(
                "MEMBER ROWS:",
                memberRows
            );

            const userIds = memberRows.map(
                (member) => member.user_id
            );

            const {
                data: profiles,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("id,email")
                .in("id", userIds);

            if (
                profileError ||
                !profiles
            ) {
                console.log(
                    "PROFILE ERROR:",
                    profileError
                );

                return;
            }

            console.log(
                "PROFILES:",
                profiles
            );

            const {
                data: expensesData,
                error: expenseError,
            } = await supabase
                .from("expenses")
                .select("*")
                .eq("group_id", groupId)
                .order("created_at", {
                    ascending: false,
                });

            if (
                expenseError ||
                !expensesData
            ) {
                console.log(
                    "EXPENSE ERROR:",
                    expenseError
                );

                return;
            }

            console.log(
                "EXPENSES:",
                expensesData
            );

            setMembers(profiles);

            setExpenses(expensesData);
        } catch (error) {
            console.log(
                "REFRESH ERROR:",
                error
            );
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

    async function handleSettleUp() {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return;
            }

            const amount =
                Number(settlementAmount);

            if (!amount) {
                Alert.alert(
                    "Enter settlement amount"
                );

                return;
            }

            const {
                error,
            } = await supabase
                .from("expenses")
                .insert([
                    {
                        title: "Settlement",
                        amount: amount,
                        paid_by: user.id,
                        group_id: groupId,
                        split_type: "settlement",
                    },
                ]);

            if (error) {
                console.log(
                    "SETTLEMENT ERROR:",
                    error
                );

                Alert.alert(
                    "Settlement failed"
                );

                return;
            }

            setSettlementAmount("");

            Alert.alert(
                "Settlement added"
            );

            await refreshData();
        } catch (error) {
            console.log(error);

            Alert.alert(
                "Something went wrong"
            );
        }
    }

    async function handleDeleteExpense(
        expenseId: string
    ) {
        try {
            console.log(
                "DELETING EXPENSE:",
                expenseId
            );

            const {
                error: splitError,
            } = await supabase
                .from("expense_splits")
                .delete()
                .eq(
                    "expense_id",
                    expenseId
                );

            if (splitError) {
                console.log(
                    "DELETE SPLIT ERROR:",
                    splitError
                );

                Alert.alert(
                    "Failed to delete splits"
                );

                return;
            }

            const {
                error,
            } = await supabase
                .from("expenses")
                .delete()
                .eq("id", expenseId);

            if (error) {
                console.log(
                    "DELETE ERROR:",
                    error
                );

                Alert.alert(
                    "You can only delete your own expenses"
                );

                return;
            }

            Alert.alert(
                "Expense deleted"
            );

            await refreshData();
        } catch (error) {
            console.log(error);

            Alert.alert(
                "Something went wrong"
            );
        }
    }

    async function handleEditExpense() {
        try {
            if (
                !editingExpenseId
            ) {
                return;
            }

            const updatedAmount =
                Number(editingAmount);

            if (
                !editingTitle ||
                !updatedAmount
            ) {
                Alert.alert(
                    "Invalid values"
                );

                return;
            }

            const {
                error,
            } = await supabase
                .from("expenses")
                .update({
                    title: editingTitle,
                    amount: updatedAmount,
                })
                .eq(
                    "id",
                    editingExpenseId
                );
            const splitAmount =
                updatedAmount /
                members.length;

            const {
                error: splitError,
            } = await supabase
                .from("expense_splits")
                .update({
                    amount: splitAmount,
                })
                .eq(
                    "expense_id",
                    editingExpenseId
                );

            if (splitError) {
                console.log(
                    splitError
                );

                Alert.alert(
                    "Failed to update splits"
                );

                return;
            }
            if (error) {
                console.log(error);

                Alert.alert(
                    "Failed to edit expense"
                );

                return;
            }

            Alert.alert(
                "Expense updated"
            );

            setEditingExpenseId("");

            setEditingTitle("");

            setEditingAmount("");

            await refreshData();

            setExpenses((prev) =>
                prev.map((expense) => {
                    if (
                        expense.id ===
                        editingExpenseId
                    ) {
                        return {
                            ...expense,
                            title:
                                editingTitle,
                            amount:
                                updatedAmount,
                        };
                    }

                    return expense;
                })
            );
        } catch (error) {
            console.log(error);

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
            members.length === 0 ||
            !currentUserId
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
            console.log(
                "PROCESSING EXPENSE:",
                expense
            );

            if (
                expense.split_type ===
                "settlement"
            ) {
                balancesMap[
                    expense.paid_by
                ] += expense.amount;

                console.log(
                    "SETTLEMENT ADDED:",
                    expense.amount
                );

                return;
            }

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

        console.log(
            "BALANCES MAP:",
            balancesMap
        );

        const currentBalance =
            balancesMap[currentUserId];

        console.log(
            "CURRENT USER BALANCE:",
            currentBalance
        );

        const otherMember =
            members.find(
                (member) =>
                    member.id !==
                    currentUserId
            );

        if (!otherMember) {
            setBalances([]);

            return;
        }

        const result: string[] = [];

        if (currentBalance > 0) {
            result.push(
                `You have to receive from ${otherMember.email} ₹${currentBalance.toFixed(0)}`
            );
        }

        if (currentBalance < 0) {
            result.push(
                `You have to give ${otherMember.email} ₹${Math.abs(currentBalance).toFixed(0)}`
            );
        }

        console.log(
            "FINAL BALANCES:",
            result
        );

        setBalances(result);
    }, [
        members,
        expenses,
        currentUserId,
    ]);

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

                <TextInput
                    placeholder="Settlement Amount"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    value={settlementAmount}
                    onChangeText={
                        setSettlementAmount
                    }
                    style={{
                        borderWidth: 1,
                        borderColor: "gray",
                        padding: 14,
                        borderRadius: 12,
                        marginTop: 16,
                        marginBottom: 16,
                        color: "white",
                    }}
                />

                <Button
                    title="Settle Up"
                    onPress={handleSettleUp}
                />
            </View>
            {editingExpenseId && (
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
                        Edit Expense
                    </Text>

                    <TextInput
                        placeholder="Title"
                        placeholderTextColor="gray"
                        value={editingTitle}
                        onChangeText={
                            setEditingTitle
                        }
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
                        value={editingAmount}
                        onChangeText={
                            setEditingAmount
                        }
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
                        title="Save Changes"
                        onPress={
                            handleEditExpense
                        }
                    />
                </View>
            )}
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

                            {item.paid_by ===
                                currentUserId && (
                                    <View
                                        style={{
                                            marginTop: 12,
                                        }}
                                    >
                                        <Button
                                            title="Delete"
                                            color="red"
                                            onPress={() =>
                                                handleDeleteExpense(
                                                    item.id
                                                )
                                            }
                                        />
                                        <Button
                                            title="Edit"
                                            onPress={() => {
                                                setEditingExpenseId(
                                                    item.id
                                                );

                                                setEditingTitle(
                                                    item.title
                                                );

                                                setEditingAmount(
                                                    String(item.amount)
                                                );
                                            }}
                                        />
                                    </View>
                                )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}