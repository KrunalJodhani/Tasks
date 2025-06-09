document.getElementById("FactButton").addEventListener("click",function(event){
    Fact();
});

function Fact(){
    var num = document.getElementById("integerInput").value;
    var ans = [1];

    for(var i=1;i<=num;i++){
        ans = calculate(ans,i);
    }
    let nm = document.getElementById("ans");
    nm.innerHTML = ans;
    console.log(ans);
}

function calculate(ans,num){
    let index = ans.length - 1;
    let carry  = 0;

    while(index >= 0){
        let tmp = (ans[index] * num) + carry;
        carry = Math.floor(tmp / 10000000000);
        ans[index] = tmp % 10000000000;
        index--;
    }

    while(carry > 0){
        ans.unshift(carry % 10000000000);
        carry = Math.floor(carry / 10000000000);
    }
    return ans;
}

