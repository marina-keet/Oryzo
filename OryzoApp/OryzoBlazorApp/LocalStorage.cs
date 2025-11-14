
using System.Threading.Tasks;
using Microsoft.JSInterop;

public class LocalStorageService
{
    private readonly IJSRuntime _js;
    public LocalStorageService(IJSRuntime js)
    {
        _js = js;
    }
    public ValueTask SetItemAsync(string key, string value)
        => _js.InvokeVoidAsync("localStorage.setItem", key, value);

    public ValueTask<string> GetItemAsync(string key)
        => _js.InvokeAsync<string>("localStorage.getItem", key);

    public ValueTask RemoveItemAsync(string key)
        => _js.InvokeVoidAsync("localStorage.removeItem", key);
}
